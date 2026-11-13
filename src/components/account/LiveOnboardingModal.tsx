import React, { useState, useEffect } from 'react';
import { useTrading } from '../../contexts/TradingContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  ShieldCheck, ShieldAlert, CheckCircle2, Clock,
  X, ArrowRight, ArrowLeft, UploadCloud, FileText
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveOnboardingModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { liveApplication, submitLiveApplication, switchAccount, accounts } = useTrading();
  const { user } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    fullName: liveApplication.fullName || user?.fullName || '',
    email: liveApplication.email || user?.email || '',
    phone: liveApplication.phone || user?.phone || '',
    country: liveApplication.country || 'Bangladesh',
    employmentStatus: liveApplication.employmentStatus || 'Employed',
    annualIncome: liveApplication.annualIncome || '$50,000 - $100,000',
    tradingExperience: liveApplication.tradingExperience || '1-3 Years',
    riskTolerance: liveApplication.riskTolerance || 'Moderate',
    idType: liveApplication.idType || 'National ID',
    idNumber: liveApplication.idNumber || '',
    proofOfAddress: liveApplication.proofOfAddress || 'Bank Statement',
    documentFileName: ''
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData((prev) => ({
        ...prev,
        fullName: liveApplication.fullName || user?.fullName || prev.fullName,
        email: liveApplication.email || user?.email || prev.email,
        phone: liveApplication.phone || user?.phone || prev.phone,
        country: liveApplication.country || 'Bangladesh'
      }));
    }
  }, [isOpen, liveApplication, user]);

  if (!isOpen) return null;

  const liveAccount = accounts.find((a) => a.mode === 'LIVE');
  const isAlreadySubmitted = liveApplication.status !== 'NOT_APPLIED';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLiveApplication({
      ...formData,
      proofOfAddress: formData.documentFileName
        ? `${formData.proofOfAddress} (${formData.documentFileName})`
        : formData.proofOfAddress
    } as any);
    setStep(4);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#111827] border border-blue-500/40 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#151F30] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Live Trading Account Onboarding & KYC</h2>
              <p className="text-[11px] text-slate-400">Direct Live Account Application · Compliance & Identity Verification</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Regulatory & Execution Notice Banner */}
        <div className="px-6 py-3 bg-[#0B1220] border-b border-slate-800 text-xs">
          <div className="flex items-start gap-2 text-amber-300">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div className="text-[11px] leading-relaxed text-slate-300">
              <strong className="text-amber-300">Live Account Governance:</strong> Once your KYC is approved, your Live account ledger unlocks verified Add Funds (bKash / Nagad / Rocket, min $10 USD). Actual live market order execution remains disabled until authorized prime-brokerage liquidity connectivity is finalized.
            </div>
          </div>
        </div>

        <div className="p-6">
          {isAlreadySubmitted && step === 1 ? (
            <div className="space-y-6">
              <div className="text-center py-4 space-y-3">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
                  {liveApplication.status === 'APPROVED_PENDING_BROKER' ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-400 stroke-[2]" />
                  ) : (
                    <Clock className="w-7 h-7 stroke-[2]" />
                  )}
                </div>
                <div className="space-y-1">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                      liveApplication.status === 'APPROVED_PENDING_BROKER'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : liveApplication.status === 'REJECTED'
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        : liveApplication.status === 'DOCS_REQUESTED'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                    }`}
                  >
                    STATUS: {liveApplication.status.replace(/_/g, ' ')}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">
                    {liveApplication.status === 'APPROVED_PENDING_BROKER'
                      ? 'KYC Approved — Live Account Active (Ledger Ready)'
                      : liveApplication.status === 'DOCS_REQUESTED'
                      ? 'Additional Verification Documents Requested'
                      : liveApplication.status === 'REJECTED'
                      ? 'Application Rejected — Resubmission Allowed'
                      : 'Compliance Verification Under Review'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {user?.kycNotes ||
                      liveApplication.rejectionReason ||
                      `Your live trading application (#${liveApplication.id}) is tracked by our compliance team.`}
                  </p>
                </div>
              </div>

              <div className="bg-[#151F30] border border-slate-800 rounded-xl p-4 divide-y divide-slate-800/80 text-xs">
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Applicant:</span>
                  <span className="font-semibold text-white">
                    {liveApplication.fullName} ({liveApplication.email})
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Assigned Live Account:</span>
                  <span className="font-mono text-blue-400 font-bold">{liveAccount?.accountNumber || 'NX-LIVE-10492'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Submission Date:</span>
                  <span className="font-mono text-slate-200">{liveApplication.submittedAt}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">KYC Document:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {liveApplication.idType} ({liveApplication.idNumber || 'Submitted'})
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Live Order Execution:</span>
                  <span className="text-amber-400 font-semibold">Disabled Pending Broker Connectivity</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-700 bg-[#0B1220] hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Update / Resubmit Info
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (liveAccount) switchAccount(liveAccount.id);
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                >
                  Switch to Live Workspace
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Step Indicators */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px]">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                      step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    1
                  </span>
                  <span className={step === 1 ? 'text-white font-semibold' : 'text-slate-400'}>Personal Profile</span>
                </div>
                <div className="h-[1px] w-8 bg-slate-800" />
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                      step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    2
                  </span>
                  <span className={step === 2 ? 'text-white font-semibold' : 'text-slate-400'}>Financial & Risk</span>
                </div>
                <div className="h-[1px] w-8 bg-slate-800" />
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                      step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    3
                  </span>
                  <span className={step === 3 ? 'text-white font-semibold' : 'text-slate-400'}>KYC Documents</span>
                </div>
              </div>

              {/* Step 1: Personal Profile */}
              {step === 1 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Applicant Personal Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Tariqul Islam"
                        className="w-full bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="trader@example.com"
                        className="w-full bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Bangladesh / Mobile Phone</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+880 17XX-XXXXXX"
                        className="w-full bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Country of Residence</label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="Bangladesh">Bangladesh</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Singapore">Singapore</option>
                        <option value="United States">United States</option>
                        <option value="Switzerland">Switzerland</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-1.5"
                    >
                      <span>Continue to Financial Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Financial Profile & Trading Experience</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Employment Status</label>
                      <select
                        value={formData.employmentStatus}
                        onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                        className="w-full bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="Employed">Full-time Employed</option>
                        <option value="Self-Employed">Self-Employed / Business</option>
                        <option value="Professional Trader">Professional Trader</option>
                        <option value="Retired">Private Investor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Estimated Annual Income (USD)</label>
                      <select
                        value={formData.annualIncome}
                        onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                        className="w-full bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                        <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                        <option value="$100,000 - $250,000">$100,000 - $250,000</option>
                        <option value="$250,000+">$250,000+ (Institutional)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Forex & CFD Experience</label>
                      <select
                        value={formData.tradingExperience}
                        onChange={(e) => setFormData({ ...formData, tradingExperience: e.target.value })}
                        className="w-full bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="Less than 1 Year">Less than 1 Year</option>
                        <option value="1-3 Years">1 - 3 Years</option>
                        <option value="3-5 Years">3 - 5 Years</option>
                        <option value="5+ Years Institutional">5+ Years (Institutional)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Risk Tolerance</label>
                      <select
                        value={formData.riskTolerance}
                        onChange={(e) => setFormData({ ...formData, riskTolerance: e.target.value as any })}
                        className="w-full bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="Conservative">Conservative</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Aggressive">Aggressive</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-3.5 py-2 border border-slate-700 text-slate-300 hover:text-white rounded-lg flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-1.5"
                    >
                      <span>Proceed to KYC Documents</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Identity Verification & File Upload */}
              {step === 3 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Identity Document & Verification</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Government ID Type</label>
                      <select
                        value={formData.idType}
                        onChange={(e) => setFormData({ ...formData, idType: e.target.value as any })}
                        className="w-full bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="National ID">National ID (NID / Smart Card)</option>
                        <option value="Passport">Passport</option>
                        <option value="Driver License">Driving License</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Document Number</label>
                      <input
                        type="text"
                        required
                        value={formData.idNumber}
                        onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                        placeholder="e.g. 1998261039402"
                        className="w-full bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Proof of Residence Type</label>
                    <select
                      value={formData.proofOfAddress}
                      onChange={(e) => setFormData({ ...formData, proofOfAddress: e.target.value })}
                      className="w-full bg-[#0B1220] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Bank Statement">Certified Bank Statement</option>
                      <option value="Utility Bill">Utility Bill (Electricity / Gas / Internet)</option>
                      <option value="Tax Assessment">Government TIN / Tax Document</option>
                    </select>
                  </div>

                  {/* Document Upload */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Upload Supporting Document (PDF / Image)</label>
                    <label className="flex items-center justify-center gap-2 border border-dashed border-slate-700 hover:border-blue-500 rounded-lg p-3 bg-[#0B1220] cursor-pointer transition-colors">
                      {formData.documentFileName ? (
                        <>
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold truncate max-w-[280px]">
                            {formData.documentFileName}
                          </span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4 text-blue-400" />
                          <span className="text-slate-400">Click to select NID / Passport / Address document file</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setFormData((prev) => ({ ...prev, documentFileName: file.name }));
                        }}
                      />
                    </label>
                  </div>

                  <label className="flex items-start gap-2 text-slate-300 cursor-pointer pt-1">
                    <input type="checkbox" required className="mt-1 rounded bg-slate-900 border-slate-700 text-blue-600" />
                    <span className="text-[11px] leading-relaxed">
                      I confirm the information provided is accurate. Live market trade execution remains disabled until regulatory broker integration is activated, while KYC approval unlocks verified Live Account ledger funding.
                    </span>
                  </label>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-3.5 py-2 border border-slate-700 text-slate-300 hover:text-white rounded-lg flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Submit Live Account Application</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <div className="space-y-5 text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Live Application Successfully Submitted</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Your KYC profile is now <span className="text-amber-400 font-semibold">UNDER REVIEW</span> by our Compliance Team.
                    </p>
                  </div>

                  <div className="bg-[#151F30] border border-slate-800 rounded-xl p-4 text-xs text-left space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assigned Live Account:</span>
                      <span className="font-mono font-bold text-blue-400">{liveAccount?.accountNumber || 'NX-LIVE-10492'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Application Reference:</span>
                      <span className="font-mono text-white">{liveApplication.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Live Order Execution:</span>
                      <span className="text-amber-400 font-semibold">Disabled Pending Broker Bridge</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (liveAccount) switchAccount(liveAccount.id);
                      onClose();
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors text-xs"
                  >
                    Go to Live Account Console
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
