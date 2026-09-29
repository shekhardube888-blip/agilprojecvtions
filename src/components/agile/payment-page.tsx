"use client";

import { useState, useEffect } from "react";
import {
  Smartphone, CreditCard, Building2, Globe, Loader2, CheckCircle2,
  ShieldCheck, Lock, Zap, ArrowRight, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Method = "upi" | "card" | "netbanking" | "international";

const PLANS = [
  { name: "Basic", price: 1499, desc: "Stage guidance + certificate" },
  { name: "Standard", price: 2499, desc: "1:1 mentor + LLM training" },
  { name: "Professional", price: 3999, desc: "Live sessions + project review" },
  { name: "Premium", price: 4999, desc: "Job-oriented + placement prep" },
];

const UPI_ID = "agileprojection@okaxis"; // Replace with your actual UPI ID
const MERCHANT_NAME = "AgileProjection NT-AI";
const BANK_ACCOUNT = {
  name: "AgileProjection NT-AI Network",
  number: "12345678901234",
  ifsc: "HDFC0001234",
  bank: "HDFC Bank",
  branch: "Bengaluru - Tech Park",
};

export function PaymentPage({ planName, studentName, onPaid }: {
  planName: string;
  studentName: string;
  onPaid: (method: string, txnId: string) => void;
}) {
  const [method, setMethod] = useState<Method>("upi");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [txnId, setTxnId] = useState("");
  const { toast } = useToast();

  const plan = PLANS.find(p => p.name === planName) || PLANS[1];
  const amount = plan.price;
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Internship ${plan.name} - ${studentName}`)}`;
  // Generate a QR-like visual (since we can't use external QR libs, use a placeholder SVG pattern)
  const qrSvg = generateQrPattern(`${upiUrl}`);

  function pay(methodLabel: string) {
    setProcessing(true);
    // Simulate payment processing (in production, integrate with Razorpay/Stripe/PayU)
    setTimeout(() => {
      const txn = "TXN" + Date.now().toString().slice(-8) + Math.random().toString(36).slice(2, 5).toUpperCase();
      setTxnId(txn);
      setDone(true);
      setProcessing(false);
      toast({ title: "Payment Successful! ✓", description: `${plan.name} plan · ₹${amount} · ${methodLabel} · ${txn}` });
      onPaid(methodLabel, txn);
    }, 2500);
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <div className="size-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 grid place-items-center text-emerald-500 mx-auto mb-4">
          <CheckCircle2 className="size-8" />
        </div>
        <h3 className="font-bold text-lg text-foreground">Payment Successful!</h3>
        <p className="text-sm text-muted-foreground mt-2">{plan.name} plan · ₹{amount}</p>
        <div className="mt-3 inline-block bg-muted/50 border border-border rounded-lg px-4 py-2 text-xs">
          <div className="text-slate-500">Transaction ID</div>
          <div className="font-mono font-bold text-cyan-500">{txnId}</div>
        </div>
        <p className="text-xs text-slate-500 mt-4">Your internship will start once the admin confirms this payment.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Plan summary */}
      <div className="bg-gradient-to-r from-cyan-400/10 to-blue-500/10 border border-cyan-400/20 rounded-xl p-4 mb-5 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500">Paying for</div>
          <div className="font-bold text-foreground text-sm">{plan.name} Plan — {plan.desc}</div>
          <div className="text-xs text-slate-500">Student: {studentName}</div>
        </div>
        <div className="text-right">
          <div className="font-bold text-2xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">₹{amount}</div>
          <div className="text-[10px] text-slate-500">incl. GST</div>
        </div>
      </div>

      {/* Method selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {[
          { key: "upi" as Method, icon: <Smartphone className="size-4" />, label: "UPI" },
          { key: "card" as Method, icon: <CreditCard className="size-4" />, label: "Card" },
          { key: "netbanking" as Method, icon: <Building2 className="size-4" />, label: "Net Banking" },
          { key: "international" as Method, icon: <Globe className="size-4" />, label: "International" },
        ].map(m => (
          <button key={m.key} onClick={() => setMethod(m.key)} className={cn(
            "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all",
            method === m.key ? "bg-cyan-400/10 border-cyan-400/40 text-cyan-500" : "bg-muted/30 border-border text-slate-500 hover:text-foreground hover:border-cyan-400/30"
          )}>
            {m.icon}
            <span className="text-xs font-medium">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Method content */}
      <div className="bg-card border border-border rounded-xl p-5">
        {method === "upi" && (
          <div className="text-center">
            <div className="text-xs text-slate-500 mb-3">Scan the QR code with any UPI app (GPay, PhonePe, Paytm)</div>
            <div className="inline-block bg-white p-3 rounded-xl shadow-lg mb-3">
              <div dangerouslySetInnerHTML={{ __html: qrSvg }} />
            </div>
            <div className="text-xs text-slate-500">or pay to UPI ID</div>
            <div className="font-mono font-bold text-cyan-500 text-sm mb-1">{UPI_ID}</div>
            <div className="text-[10px] text-slate-500 mb-4">Amount: ₹{amount} · {MERCHANT_NAME}</div>
            <Button onClick={() => pay("UPI")} disabled={processing} className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:opacity-90 h-11">
              {processing ? <><Loader2 className="size-4 animate-spin mr-2" />Processing…</> : <><Smartphone className="size-4 mr-2" />I've Paid ₹{amount} via UPI</>}
            </Button>
          </div>
        )}

        {method === "card" && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Card Number</Label>
              <Input placeholder="1234 5678 9012 3456" maxLength={19} className="bg-muted/50 border-border mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Expiry (MM/YY)</Label><Input placeholder="12/26" maxLength={5} className="bg-muted/50 border-border mt-1" /></div>
              <div><Label className="text-xs">CVV</Label><Input type="password" placeholder="•••" maxLength={4} className="bg-muted/50 border-border mt-1" /></div>
            </div>
            <div><Label className="text-xs">Name on Card</Label><Input placeholder={studentName} className="bg-muted/50 border-border mt-1" /></div>
            <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
              <span className="inline-flex items-center gap-1"><Lock className="size-3" />256-bit SSL</span>
              <span className="inline-flex items-center gap-1"><ShieldCheck className="size-3" />PCI DSS</span>
              <span>Visa · Mastercard · RuPay · Amex</span>
            </div>
            <Button onClick={() => pay("Card")} disabled={processing} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90 h-11">
              {processing ? <><Loader2 className="size-4 animate-spin mr-2" />Processing…</> : <><CreditCard className="size-4 mr-2" />Pay ₹{amount} via Card</>}
            </Button>
          </div>
        )}

        {method === "netbanking" && (
          <div className="space-y-3">
            <div className="text-xs text-slate-500">Select your bank to proceed</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {["HDFC Bank", "State Bank of India", "ICICI Bank", "Axis Bank", "Kotak Mahindra", "Punjab National", "Bank of Baroda", "Canara Bank", "Yes Bank"].map(b => (
                <button key={b} className="text-xs px-2 py-2.5 rounded-lg bg-muted/50 border border-border text-slate-600 hover:text-cyan-500 hover:border-cyan-400/30 text-left">
                  <Building2 className="size-3 inline mr-1.5 text-slate-400" />{b}
                </button>
              ))}
            </div>
            <div className="pt-2 border-t border-border">
              <div className="text-[10px] text-slate-500 mb-2">Bank Transfer (Manual)</div>
              <div className="bg-muted/30 rounded-lg p-3 text-xs space-y-1">
                <div><span className="text-slate-500">Account:</span> <span className="font-mono text-foreground">{BANK_ACCOUNT.number}</span></div>
                <div><span className="text-slate-500">IFSC:</span> <span className="font-mono text-foreground">{BANK_ACCOUNT.ifsc}</span></div>
                <div><span className="text-slate-500">Name:</span> <span className="text-foreground">{BANK_ACCOUNT.name}</span></div>
                <div><span className="text-slate-500">Bank:</span> <span className="text-foreground">{BANK_ACCOUNT.bank}</span></div>
              </div>
            </div>
            <Button onClick={() => pay("Net Banking")} disabled={processing} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90 h-11">
              {processing ? <><Loader2 className="size-4 animate-spin mr-2" />Processing…</> : <><Building2 className="size-4 mr-2" />I've Paid ₹{amount} via Net Banking</>}
            </Button>
          </div>
        )}

        {method === "international" && (
          <div className="space-y-3">
            <div className="text-xs text-slate-500">For international students (USD equivalent)</div>
            <div className="flex items-center gap-2">
              <div className="flex-1"><Label className="text-xs">Card Number</Label><Input placeholder="1234 5678 9012 3456" maxLength={19} className="bg-muted/50 border-border mt-1" /></div>
              <div className="w-16"><Label className="text-xs">CVC</Label><Input type="password" placeholder="•••" maxLength={4} className="bg-muted/50 border-border mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Expiry</Label><Input placeholder="MM/YY" maxLength={5} className="bg-muted/50 border-border mt-1" /></div>
              <div><Label className="text-xs">Country</Label><select className="w-full mt-1 bg-muted/50 border border-border rounded-md h-9 px-2 text-sm text-foreground"><option>India</option><option>USA</option><option>UK</option><option>Singapore</option><option>UAE</option><option>Other</option></select></div>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
              <span className="inline-flex items-center gap-1"><Lock className="size-3" />Secured by Stripe</span>
              <span>Visa · Mastercard · Amex · Discover</span>
            </div>
            <div className="text-xs text-slate-500">Estimated: ${(amount / 83).toFixed(2)} USD</div>
            <Button onClick={() => pay("International Card")} disabled={processing} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90 h-11">
              {processing ? <><Loader2 className="size-4 animate-spin mr-2" />Processing…</> : <><Globe className="size-4 mr-2" />Pay ${(amount / 83).toFixed(2)} via Card</>}
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-slate-500">
        <ShieldCheck className="size-3 text-cyan-500" />
        100% Secure Payments · Powered by AgileProjection NT-AI · This is a test version
      </div>
    </div>
  );
}

// Generate a simple QR-like SVG pattern (visual placeholder for UPI QR)
function generateQrPattern(data: string): string {
  const size = 180;
  const cells = 21;
  const cellSize = size / cells;
  let rects = "";
  // Use the data string to create a deterministic pattern
  let hash = 0;
  for (let i = 0; i < data.length; i++) hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      // Corner markers
      const isCorner = (x < 7 && y < 7) || (x >= cells - 7 && y < 7) || (x < 7 && y >= cells - 7);
      const bit = ((hash >> ((x * 7 + y * 3) % 31)) & 1) === 1;
      if (isCorner) {
        const cx = x < 7 ? 0 : cells - 7;
        const cy = y < 7 ? 0 : cells - 7;
        const dx = x - cx, dy = y - cy;
        if (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4)) {
          rects += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0a0e1a"/>`;
        }
      } else if (bit) {
        rects += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0a0e1a"/>`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="white"/>${rects}</svg>`;
}
