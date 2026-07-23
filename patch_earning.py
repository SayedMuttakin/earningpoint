import sys
sys.stdout.reconfigure(encoding='utf-8')

filepath = 'frontend/src/components/EarningPage.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")

# Find the payment UI ternary block
ternary_idx = None
null_idx = None

for i, line in enumerate(lines):
    stripped = line.strip()
    if stripped == '{((!isPremium && ipStep === 3) || (isPremium && ipStep === 4)) ? (' and ternary_idx is None:
        ternary_idx = i
    if ') : null}' in line and ternary_idx is not None and null_idx is None:
        null_idx = i

print(f"Ternary: {ternary_idx+1}, Null: {null_idx+1}")
print("Line at ternary:", repr(lines[ternary_idx][:100]))
print("Line at null:", repr(lines[null_idx][:100]))

# New premium payment UI
new_ui = [
    '              {((!isPremium && ipStep === 3) || (isPremium && ipStep === 4)) ? (\n',
    '                <div className="flex flex-col gap-4 pt-2">\n',
    '\n',
    '                   {/* Header */}\n',
    '                   <div className="text-center">\n',
    '                      <h2 className="text-lg font-black text-white mb-1 tracking-tight">Secure Checkout</h2>\n',
    '                      <p className="text-slate-400 text-xs">Powered by ZiniPay Payment Gateway</p>\n',
    '                   </div>\n',
    '\n',
    '                   {/* Amount Card */}\n',
    '                   <div className="flex items-center justify-between bg-gradient-to-r from-[#FACC15]/15 to-[#EAB308]/5 border border-[#FACC15]/30 rounded-2xl px-4 py-3">\n',
    '                      <div>\n',
    '                         <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Total Amount</p>\n',
    '                         <p className="text-[#FACC15] text-2xl font-black tracking-tight">\u09f3{(globalSettings.premiumIpPackages?.find(p => p.id === selectedPackage)?.price || (selectedPackage === \'1\' ? 700 : 0)) + 25}</p>\n',
    '                      </div>\n',
    '                      <div className="text-right">\n',
    '                         <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Includes</p>\n',
    '                         <p className="text-emerald-400 text-xs font-bold">\u09f325 VAT</p>\n',
    '                      </div>\n',
    '                   </div>\n',
    '\n',
    '                   {/* Gateway Card */}\n',
    '                   <div className="relative bg-gradient-to-br from-[#0F1520] to-[#151A23] rounded-2xl border border-[#FACC15]/20 overflow-hidden">\n',
    '                      {/* Glow */}\n',
    '                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>\n',
    '                      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"></div>\n',
    '\n',
    '                      <div className="relative z-10 p-5">\n',
    '                         {/* Gateway Badge */}\n',
    '                         <div className="flex items-center justify-between mb-4">\n',
    '                            <div className="flex items-center gap-2">\n',
    '                               <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">\n',
    '                                  <Zap className="w-5 h-5 text-slate-900" />\n',
    '                               </div>\n',
    '                               <div>\n',
    '                                  <p className="text-white font-black text-sm leading-tight">ZiniPay Gateway</p>\n',
    '                                  <p className="text-amber-400 text-[10px] font-bold">Auto Verified</p>\n',
    '                               </div>\n',
    '                            </div>\n',
    '                            <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">\n',
    '                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>\n',
    '                               <span className="text-emerald-400 text-[10px] font-black uppercase tracking-wide">Live</span>\n',
    '                            </div>\n',
    '                         </div>\n',
    '\n',
    '                         {/* Description */}\n',
    '                         <p className="text-slate-300 text-xs leading-relaxed mb-4">\n',
    '                            Complete your payment on our secure gateway using any of the methods below. Your VPN subscription activates <span className="text-[#FACC15] font-bold">instantly</span> after payment.\n',
    '                         </p>\n',
    '\n',
    '                         {/* Payment Methods */}\n',
    '                         <div className="grid grid-cols-4 gap-2 mb-4">\n',
    '                            {[\n',
    '                               { src: \'/logos/bkash.png\', label: \'bKash\' },\n',
    '                               { src: \'/logos/nagad.png\', label: \'Nagad\' },\n',
    '                               { src: \'/logos/rocket.png\', label: \'Rocket\' },\n',
    '                               { src: null, label: \'Cards\' },\n',
    '                            ].map((m) => (\n',
    '                               <div key={m.label} className="flex flex-col items-center gap-1.5 bg-white/5 rounded-xl py-2.5 px-1 border border-white/8">\n',
    '                                  {m.src ? (\n',
    '                                     <img src={m.src} alt={m.label} className="h-7 w-auto object-contain" />\n',
    '                                  ) : (\n',
    '                                     <div className="h-7 w-10 flex items-center justify-center">\n',
    '                                        <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-400" fill="currentColor"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>\n',
    '                                     </div>\n',
    '                                  )}\n',
    '                                  <span className="text-[9px] text-slate-400 font-bold">{m.label}</span>\n',
    '                               </div>\n',
    '                            ))}\n',
    '                         </div>\n',
    '\n',
    '                         {/* Features */}\n',
    '                         <div className="grid grid-cols-3 gap-2">\n',
    '                            {[\n',
    '                               { icon: \'🔒\', text: \'Secure\' },\n',
    '                               { icon: \'⚡\', text: \'Instant\' },\n',
    '                               { icon: \'🤖\', text: \'Auto\' },\n',
    '                            ].map((f) => (\n',
    '                               <div key={f.text} className="flex flex-col items-center gap-1 bg-black/20 rounded-xl py-2 border border-white/5">\n',
    '                                  <span className="text-base leading-none">{f.icon}</span>\n',
    '                                  <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">{f.text}</span>\n',
    '                               </div>\n',
    '                            ))}\n',
    '                         </div>\n',
    '                      </div>\n',
    '                   </div>\n',
    '\n',
    '                   {/* Trust Line */}\n',
    '                   <p className="text-center text-slate-500 text-[10px] flex items-center justify-center gap-1">\n',
    '                      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-slate-500 inline"><path d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z"/></svg>\n',
    '                      256-bit SSL Encrypted &bull; 100% Secure\n',
    '                   </p>\n',
    '\n',
    '                </div>\n',
    '              ) : null}\n',
]

# Replace
lines = lines[:ternary_idx] + new_ui + lines[null_idx+1:]
print(f"Payment UI replaced. Lines now: {len(lines)}")

# Fix action button text
for i, line in enumerate(lines):
    if 'PAY VIA ZINIPAY AUTO GATEWAY' in line or 'CONNECTING GATEWAY' in line or 'CONNECTING...' in line:
        # Keep these - they're already correct
        pass
    if 'CONFIRM ORDER' in line and 'Check' not in line:
        lines[i] = '                             PAY VIA ZINIPAY AUTO GATEWAY\n'
        print(f"Fixed button text at line {i+1}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Done!")
