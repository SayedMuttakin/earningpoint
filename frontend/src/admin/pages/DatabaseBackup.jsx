import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, Download, Upload, Copy, Check, RefreshCw, AlertTriangle, 
  Trash2, FileJson, CheckCircle2, AlertCircle, ArrowRight, Layers,
  HardDrive, ShieldCheck, ChevronDown, ChevronUp, Sparkles, X, Eye,
  Image as ImageIcon, Globe, Zap, CheckCheck
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

const DatabaseBackup = ({ ADMIN_API, authHeaders }) => {
  const [dbStats, setDbStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState('');
  
  // Export states
  const [exportingFull, setExportingFull] = useState(false);
  const [exportingCol, setExportingCol] = useState(null);
  const [copiedFull, setCopiedFull] = useState(false);
  const [includeMediaExport, setIncludeMediaExport] = useState(true);

  // View JSON Modal
  const [viewJsonModal, setViewJsonModal] = useState(false);
  const [viewJsonTitle, setViewJsonTitle] = useState('');
  const [viewJsonData, setViewJsonData] = useState('');
  const [modalCopied, setModalCopied] = useState(false);
  
  // Import states
  const [importTab, setImportTab] = useState('paste'); // 'paste' | 'upload'
  const [pastedJson, setPastedJson] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [importMode, setImportMode] = useState('upsert'); // 'upsert' | 'replace'
  const [targetCollection, setTargetCollection] = useState(''); // '' = auto-detect
  const [importSourceUrl, setImportSourceUrl] = useState('http://72.61.117.87:5010');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Live Media Sync states
  const [syncSourceUrl, setSyncSourceUrl] = useState('http://72.61.117.87:5010');
  const [syncingMedia, setSyncingMedia] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  
  // Danger Zone
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearTargetCol, setClearTargetCol] = useState('all');
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [clearing, setClearing] = useState(false);

  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4500);
  };

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`${ADMIN_API}/database/stats`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setDbStats(data);
      } else {
        showToast('❌ Failed to fetch database stats');
      }
    } catch (err) {
      console.error(err);
      showToast('❌ Error connecting to server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // ── Universal Download Helper ──
  const downloadJsonFile = async (data, filename) => {
    const jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

    // If native mobile app via Capacitor
    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share({
          title: filename,
          text: jsonStr,
          dialogTitle: 'Save Database Backup'
        });
        showToast('✅ Share / Save dialog opened!');
        return true;
      } catch (e) {
        console.log('Capacitor share fallback:', e);
      }
    }

    // Web Browser Blob download
    try {
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 500);

      showToast('✅ File download started!');
      return true;
    } catch (err) {
      // Fallback Data URI
      try {
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr);
        const link = document.createElement('a');
        link.href = dataUri;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
        }, 500);
        showToast('✅ File download started!');
        return true;
      } catch (err2) {
        // Fallback: Open Modal to Copy
        setViewJsonTitle(filename);
        setViewJsonData(jsonStr);
        setViewJsonModal(true);
        showToast('ℹ️ Download blocked by browser, opened in viewer to copy!');
        return false;
      }
    }
  };

  // ── Export Full Database ──
  const handleDownloadFullExport = async () => {
    setExportingFull(true);
    try {
      const query = new URLSearchParams({
        download: 'true',
        includeMedia: includeMediaExport ? 'true' : 'false'
      }).toString();

      const res = await fetch(`${ADMIN_API}/database/export?${query}`, { headers: authHeaders });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast('❌ ' + (err.message || 'Failed to export database'));
        return;
      }
      const data = await res.json();
      const filename = `database_backup_${includeMediaExport ? 'with_images_' : ''}${new Date().toISOString().slice(0, 10)}.json`;
      await downloadJsonFile(data, filename);
    } catch (err) {
      console.error(err);
      showToast('❌ Export error: ' + err.message);
    } finally {
      setExportingFull(false);
    }
  };

  // ── Copy Full JSON to Clipboard ──
  const handleCopyFullJson = async () => {
    setExportingFull(true);
    try {
      const query = new URLSearchParams({
        includeMedia: includeMediaExport ? 'true' : 'false'
      }).toString();

      const res = await fetch(`${ADMIN_API}/database/export?${query}`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        const jsonStr = JSON.stringify(data, null, 2);
        await navigator.clipboard.writeText(jsonStr);
        setCopiedFull(true);
        setTimeout(() => setCopiedFull(false), 3000);
        showToast('📋 Entire database JSON copied to clipboard!');
      } else {
        showToast('❌ Failed to copy export data');
      }
    } catch (err) {
      showToast('❌ Failed to copy JSON');
    } finally {
      setExportingFull(false);
    }
  };

  // ── View Full JSON in Modal ──
  const handleViewFullJson = async () => {
    setExportingFull(true);
    try {
      const query = new URLSearchParams({
        includeMedia: includeMediaExport ? 'true' : 'false'
      }).toString();

      const res = await fetch(`${ADMIN_API}/database/export?${query}`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        const jsonStr = JSON.stringify(data, null, 2);
        setViewJsonTitle(`database_backup_${includeMediaExport ? 'with_images_' : ''}${new Date().toISOString().slice(0, 10)}.json`);
        setViewJsonData(jsonStr);
        setViewJsonModal(true);
      } else {
        showToast('❌ Failed to load JSON data');
      }
    } catch (err) {
      showToast('❌ Error loading JSON');
    } finally {
      setExportingFull(false);
    }
  };

  // ── Export Single Collection ──
  const handleExportSingleCol = async (colName) => {
    setExportingCol(colName);
    try {
      const query = new URLSearchParams({
        collection: colName,
        includeMedia: includeMediaExport ? 'true' : 'false'
      }).toString();

      const res = await fetch(`${ADMIN_API}/database/export?${query}`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        const filename = `${colName}_backup_${new Date().toISOString().slice(0, 10)}.json`;
        await downloadJsonFile(data, filename);
      } else {
        showToast(`❌ Failed to export '${colName}'`);
      }
    } catch (err) {
      showToast(`❌ Failed to export '${colName}'`);
    } finally {
      setExportingCol(null);
    }
  };

  // ── File Selection for Upload ──
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target.result);
    };
    reader.readAsText(file);
  };

  // ── Format / Beautify Pasted JSON ──
  const handleBeautifyPasted = () => {
    try {
      if (!pastedJson.trim()) return;
      const parsed = JSON.parse(pastedJson);
      setPastedJson(JSON.stringify(parsed, null, 2));
      showToast('✨ JSON formatted nicely!');
    } catch (err) {
      showToast('❌ Invalid JSON syntax: ' + err.message);
    }
  };

  // ── Perform Import ──
  const handleExecuteImport = async () => {
    const rawData = importTab === 'paste' ? pastedJson : fileContent;
    if (!rawData || !rawData.trim()) {
      showToast('❌ Please paste JSON data or select a JSON file to import.');
      return;
    }

    // Pre-validate JSON
    try {
      JSON.parse(rawData);
    } catch (e) {
      showToast('❌ Invalid JSON format: ' + e.message);
      return;
    }

    if (importMode === 'replace') {
      const confirmReplace = window.confirm(
        '⚠️ WARNING: You have selected "Wipe & Replace" mode. This will DELETE existing data in the imported collection(s) and replace with new data. Are you sure you want to continue?'
      );
      if (!confirmReplace) return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const res = await fetch(`${ADMIN_API}/database/import`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: rawData,
          mode: importMode,
          targetCollection: targetCollection || undefined,
          sourceServerUrl: importSourceUrl.trim() || undefined,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setImportResult(result);
        showToast('🎉 ' + result.message);
        fetchStats();
      } else {
        showToast('❌ ' + (result.message || 'Import failed'));
        if (result.summary) setImportResult(result);
      }
    } catch (err) {
      console.error(err);
      showToast('❌ Server error during database import: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  // ── Sync Missing Media from Old Server ──
  const handleSyncMedia = async () => {
    if (!syncSourceUrl.trim()) {
      showToast('❌ Please provide the source server URL/IP (e.g. http://72.61.117.87:5010)');
      return;
    }

    setSyncingMedia(true);
    setSyncResult(null);

    try {
      const res = await fetch(`${ADMIN_API}/database/sync-media`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceServerUrl: syncSourceUrl.trim()
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSyncResult(data);
        showToast('🎉 ' + data.message);
        fetchStats();
      } else {
        showToast('❌ ' + (data.message || 'Failed to sync media'));
        if (data.stats) setSyncResult(data);
      }
    } catch (err) {
      console.error(err);
      showToast('❌ Error during media sync: ' + err.message);
    } finally {
      setSyncingMedia(false);
    }
  };

  // ── Danger Zone Clear Database ──
  const handleClearDatabase = async () => {
    if (clearConfirmText !== 'CONFIRM_RESET_DATABASE') {
      showToast('❌ Please type CONFIRM_RESET_DATABASE exactly to proceed.');
      return;
    }

    setClearing(true);
    try {
      const res = await fetch(`${ADMIN_API}/database/clear`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmation: clearConfirmText,
          collection: clearTargetCol,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('✅ ' + data.message);
        setShowClearModal(false);
        setClearConfirmText('');
        fetchStats();
      } else {
        showToast('❌ ' + data.message);
      }
    } catch (err) {
      showToast('❌ Error clearing database');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 right-6 z-[100] bg-slate-900/95 border border-indigo-500/40 text-white px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
          <span className="font-bold text-sm">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Database Backup & Migration</h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                Export, backup, paste, or restore full database JSON without errors
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-all border border-slate-700 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            Refresh Stats
          </button>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#0F172A] p-5 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Database Name</span>
            <div className="text-xl font-black text-white mt-1 font-mono flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              {dbStats?.dbName || 'MongoDB'}
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
            Connected
          </span>
        </div>

        <div className="bg-[#0F172A] p-5 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Collections</span>
            <div className="text-2xl font-black text-indigo-400 mt-1 font-mono">
              {dbStats?.totalCollections ?? '—'}
            </div>
          </div>
          <Layers className="w-6 h-6 text-indigo-400/50" />
        </div>

        <div className="bg-[#0F172A] p-5 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Documents</span>
            <div className="text-2xl font-black text-purple-400 mt-1 font-mono">
              {dbStats?.totalDocuments?.toLocaleString() ?? '—'}
            </div>
          </div>
          <FileJson className="w-6 h-6 text-purple-400/50" />
        </div>

        <div className="bg-[#0F172A] p-5 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Stored Uploads</span>
            <div className="text-2xl font-black text-teal-400 mt-1 font-mono">
              {dbStats?.totalUploadsCount?.toLocaleString() ?? '0'}
            </div>
          </div>
          <ImageIcon className="w-6 h-6 text-teal-400/50" />
        </div>
      </div>

      {/* ─── TOOL: SYNC MISSING MEDIA FROM OLD SERVER ─── */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-[#0F172A] to-slate-900 p-6 rounded-3xl border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                Sync Missing Images / Media from Old Server
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                  1-Click Fix
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Imported database records on this new server, but images/avatars/posts look blank? Pull all missing images over HTTP.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-8 space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              Source Server URL / IP (Where original images are hosted):
            </label>
            <input
              type="text"
              value={syncSourceUrl}
              onChange={(e) => setSyncSourceUrl(e.target.value)}
              placeholder="e.g. http://72.61.117.87:5010"
              className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-4">
            <button
              onClick={handleSyncMedia}
              disabled={syncingMedia || !syncSourceUrl.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-indigo-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {syncingMedia ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning & Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Start Live Media Sync</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sync Result Summary */}
        {syncResult && (
          <div className="mt-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-indigo-400 flex items-center gap-1.5">
                <CheckCheck className="w-4 h-4" />
                Media Sync Result
              </h4>
              <button 
                onClick={() => setSyncResult(null)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {syncResult.stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-[#0F172A] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Total Referenced</span>
                  <span className="text-sm font-black text-white font-mono">{syncResult.stats.totalReferenced}</span>
                </div>
                <div className="bg-[#0F172A] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Downloaded New</span>
                  <span className="text-sm font-black text-emerald-400 font-mono">+{syncResult.stats.downloaded}</span>
                </div>
                <div className="bg-[#0F172A] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Already Existed</span>
                  <span className="text-sm font-black text-indigo-400 font-mono">{syncResult.stats.existing}</span>
                </div>
                <div className="bg-[#0F172A] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Missing on Source</span>
                  <span className="text-sm font-black text-amber-400 font-mono">{syncResult.stats.failed}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Grid: Left = Backup / Export, Right = Import / Paste */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ─── LEFT: BACKUP / EXPORT SECTION (5 cols) ─── */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Full Database Quick Actions */}
          <div className="bg-[#0F172A] p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-400" />
                Export Full Database
              </h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Complete Backup
              </span>
            </div>

            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Export all database collections (users, posts, messages, settings, transactions, verifications, banners) into JSON format.
            </p>

            {/* Include Media Checkbox */}
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white block">Include Images & Media Files</span>
                  <span className="text-[10px] text-slate-400 block font-medium">Embeds all uploaded photos/audio into the JSON</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={includeMediaExport} 
                  onChange={(e) => setIncludeMediaExport(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <button
                onClick={handleDownloadFullExport}
                disabled={exportingFull}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50"
              >
                <Download className={`w-4 h-4 ${exportingFull ? 'animate-bounce' : ''}`} />
                <span>{exportingFull ? 'Exporting...' : 'Download Full .JSON File'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopyFullJson}
                  disabled={exportingFull}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {copiedFull ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedFull ? 'Copied!' : 'Copy JSON'}</span>
                </button>

                <button
                  onClick={handleViewFullJson}
                  disabled={exportingFull}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span>View JSON</span>
                </button>
              </div>
            </div>
          </div>

          {/* Individual Collections List */}
          <div className="bg-[#0F172A] p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Collections ({dbStats?.collections?.length || 0})
              </h3>
              <span className="text-[11px] text-slate-400 font-bold">Single Export</span>
            </div>

            <div className="divide-y divide-slate-800/60 max-h-[340px] overflow-y-auto pr-1">
              {loading ? (
                <div className="py-8 text-center text-slate-500 text-xs font-bold">Loading collections...</div>
              ) : !dbStats?.collections?.length ? (
                <div className="py-8 text-center text-slate-500 text-xs font-bold">No collections found</div>
              ) : (
                dbStats.collections.map((col) => (
                  <div key={col.name} className="py-2.5 flex items-center justify-between gap-2 hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                    <div className="min-w-0">
                      <span className="text-xs font-mono font-bold text-white block truncate">
                        {col.name}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {col.count.toLocaleString()} document{col.count !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <button
                      onClick={() => handleExportSingleCol(col.name)}
                      disabled={exportingCol === col.name}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold border border-slate-700 flex items-center gap-1.5 transition-all active:scale-95 flex-shrink-0"
                      title={`Export ${col.name}`}
                    >
                      <Download className={`w-3 h-3 ${exportingCol === col.name ? 'animate-bounce text-indigo-400' : ''}`} />
                      <span>Export</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* ─── RIGHT: IMPORT / PASTE SECTION (7 cols) ─── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0F172A] p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5">
            
            {/* Header + Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-emerald-400" />
                  Import / Paste JSON Data
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Paste entire database JSON or single collection array to restore
                </p>
              </div>

              {/* Tabs */}
              <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setImportTab('paste')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    importTab === 'paste' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Paste JSON
                </button>
                <button
                  onClick={() => setImportTab('upload')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    importTab === 'upload' 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>

            {/* Mode & Target Options Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
              {/* Import Mode */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Import Mode
                </label>
                <select
                  value={importMode}
                  onChange={(e) => setImportMode(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="upsert">🛡️ Upsert / Merge (Safe - Update & Insert)</option>
                  <option value="replace">⚠️ Wipe & Replace (Deletes old data)</option>
                </select>
              </div>

              {/* Target Collection (Optional) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Target Collection
                </label>
                <select
                  value={targetCollection}
                  onChange={(e) => setTargetCollection(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">⚡ Auto-Detect from JSON</option>
                  {dbStats?.collections?.map((col) => (
                    <option key={col.name} value={col.name}>
                      {col.name} ({col.count} docs)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Source Server URL for auto-downloading images during import */}
            <div className="bg-slate-900/70 p-3 rounded-2xl border border-slate-800 space-y-1">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-teal-400" />
                Fallback Source Server URL (Auto-download missing media):
              </label>
              <input
                type="text"
                value={importSourceUrl}
                onChange={(e) => setImportSourceUrl(e.target.value)}
                placeholder="http://72.61.117.87:5010"
                className="w-full bg-[#0B1120] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
              <span className="text-[10px] text-slate-400 block">
                If the JSON does not contain embedded Base64 images, images will automatically be downloaded from this server.
              </span>
            </div>

            {/* Tab 1: Paste JSON */}
            {importTab === 'paste' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    Paste JSON String / Array:
                  </label>
                  <button
                    type="button"
                    onClick={handleBeautifyPasted}
                    disabled={!pastedJson.trim()}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 disabled:opacity-40"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Format JSON
                  </button>
                </div>

                <textarea
                  value={pastedJson}
                  onChange={(e) => setPastedJson(e.target.value)}
                  placeholder={`Example JSON format:\n{\n  "collections": {\n    "users": [ { "_id": "...", "name": "John", ... } ],\n    "posts": [ { ... } ]\n  }\n}\n\nOr directly paste an array of documents:\n[\n  { "name": "...", "email": "..." }\n]`}
                  rows={13}
                  className="w-full bg-[#0B1120] border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-y leading-relaxed"
                  spellCheck={false}
                />
              </div>
            ) : (
              /* Tab 2: Upload File */
              <div className="space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-900/50 hover:bg-slate-900/80 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3"
                >
                  <FileJson className="w-12 h-12 text-indigo-400/80" />
                  <div>
                    <p className="text-sm font-bold text-white">
                      {selectedFile ? selectedFile.name : 'Click to browse or drop .json backup file here'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Supports full database exports or collection JSON files'}
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".json,application/json"
                    className="hidden"
                  />
                </div>

                {fileContent && (
                  <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-3 text-xs font-mono text-slate-400 max-h-40 overflow-y-auto">
                    <span className="text-emerald-400 font-bold block mb-1">File Preview:</span>
                    {fileContent.slice(0, 1000)} {fileContent.length > 1000 && '...'}
                  </div>
                )}
              </div>
            )}

            {/* Execute Button */}
            <div className="pt-2">
              <button
                onClick={handleExecuteImport}
                disabled={importing || (importTab === 'paste' ? !pastedJson.trim() : !fileContent)}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {importing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Processing & Importing Database...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Execute Database Import / Restore</span>
                  </>
                )}
              </button>
            </div>

            {/* Import Result Summary Card */}
            {importResult && (
              <div className="mt-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Import Execution Summary
                  </h4>
                  <button 
                    onClick={() => setImportResult(null)}
                    className="text-slate-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {importResult.stats && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                    <div className="bg-[#0F172A] p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold">Inserted</span>
                      <span className="text-base font-black text-emerald-400 font-mono">+{importResult.stats.totalImported}</span>
                    </div>
                    <div className="bg-[#0F172A] p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold">Updated</span>
                      <span className="text-base font-black text-indigo-400 font-mono">~{importResult.stats.totalUpdated}</span>
                    </div>
                    <div className="bg-[#0F172A] p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold">Media Restored</span>
                      <span className="text-base font-black text-teal-400 font-mono">+{importResult.stats.mediaFilesRestored || 0}</span>
                    </div>
                    <div className="bg-[#0F172A] p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold">Skipped</span>
                      <span className="text-base font-black text-amber-400 font-mono">{importResult.stats.totalSkipped}</span>
                    </div>
                    <div className="bg-[#0F172A] p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold">Errors</span>
                      <span className="text-base font-black text-rose-400 font-mono">{importResult.stats.totalErrors}</span>
                    </div>
                  </div>
                )}

                {/* Per collection details */}
                {importResult.summary && (
                  <div className="divide-y divide-slate-800/60 max-h-48 overflow-y-auto pr-1 text-xs">
                    {Object.entries(importResult.summary).map(([col, s]) => (
                      <div key={col} className="py-2 flex items-center justify-between text-slate-300">
                        <span className="font-mono font-bold text-white">{col}</span>
                        <div className="flex gap-3 text-[11px] font-semibold font-mono">
                          <span className="text-emerald-400">+{s.inserted} in</span>
                          <span className="text-indigo-400">~{s.updated} up</span>
                          {s.skipped > 0 && <span className="text-amber-400">{s.skipped} skip</span>}
                          {s.errors?.length > 0 && <span className="text-rose-400">{s.errors.length} err</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* ─── DANGER ZONE: CLEAR / RESET DATABASE ─── */}
      <div className="bg-rose-950/20 border border-rose-900/40 p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-2.5 text-rose-400">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-sm font-black uppercase tracking-wider">Danger Zone — Clear Database</h3>
        </div>
        <p className="text-xs text-rose-300/80 font-medium leading-relaxed">
          Need to purge test data or reset collections? This action will permanently remove documents from the specified collection or the entire database.
        </p>
        <button
          onClick={() => setShowClearModal(true)}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all active:scale-95"
        >
          Reset / Clear Collections
        </button>
      </div>

      {/* Clear Database Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0F172A] border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-black">Confirm Database Reset</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will permanently delete records. Please select which collection to clear and type <span className="text-rose-400 font-mono font-black">CONFIRM_RESET_DATABASE</span> below:
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Collection to Clear</label>
              <select
                value={clearTargetCol}
                onChange={(e) => setClearTargetCol(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-rose-500"
              >
                <option value="all">🔥 ALL COLLECTIONS (Entire Database)</option>
                {dbStats?.collections?.map((col) => (
                  <option key={col.name} value={col.name}>
                    {col.name} ({col.count} docs)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase">Confirmation Code</label>
              <input
                type="text"
                value={clearConfirmText}
                onChange={(e) => setClearConfirmText(e.target.value)}
                placeholder="Type: CONFIRM_RESET_DATABASE"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-rose-500 placeholder-slate-600"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowClearModal(false);
                  setClearConfirmText('');
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleClearDatabase}
                disabled={clearing || clearConfirmText !== 'CONFIRM_RESET_DATABASE'}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-black transition-all shadow-lg shadow-rose-600/20"
              >
                {clearing ? 'Clearing...' : 'Confirm Clear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── VIEW / COPY FULL JSON MODAL ─── */}
      {viewJsonModal && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0F172A] border border-slate-800 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-4 text-white flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-black truncate">{viewJsonTitle || 'Database JSON Viewer'}</h3>
              </div>
              <button 
                onClick={() => setViewJsonModal(false)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 bg-[#0B1120] border border-slate-800 rounded-2xl p-4 overflow-y-auto">
              <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap break-words leading-relaxed select-all">
                {viewJsonData}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 shrink-0">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(viewJsonData);
                  setModalCopied(true);
                  setTimeout(() => setModalCopied(false), 2500);
                  showToast('📋 Copied all JSON to clipboard!');
                }}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all"
              >
                {modalCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{modalCopied ? 'Copied to Clipboard!' : 'Copy All JSON'}</span>
              </button>

              <button
                onClick={() => {
                  downloadJsonFile(viewJsonData, viewJsonTitle || 'database_backup.json');
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Save / Download File</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DatabaseBackup;
