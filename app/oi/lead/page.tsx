export const dynamic = "force-dynamic";

const FOCUS = "outline-none focus:ring-2 focus:ring-white/30";

function Field({
  label,
  name,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="text-xs text-white/60 mb-2">{label}{required ? " *" : ""}</div>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 ${FOCUS}`}
      />
    </label>
  );
}

export default function LeadPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-7 md:p-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-white/60">Retail • Lead Capture</div>
            <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight">Request access</h1>
            <p className="mt-3 text-sm md:text-base text-white/70">
              Drop your info and we’ll route you to the right retail node. (Public-safe demo)
            </p>
          </div>
          <a
            href="/oi/retail"
            className="hidden md:inline-flex rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm font-semibold text-white/85 hover:text-white hover:bg-black/40 transition-colors"
          >
            Back to Retail Hub
          </a>
        </div>

        {/* Form card */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5 md:p-6">
          <form action="/api/retail/lead-capture" method="POST">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Email" name="email" type="email" required placeholder="you@company.com" />
              <Field label="Name" name="name" required placeholder="First Last" />
              <Field label="Company (optional)" name="company" placeholder="Company Inc." />
              <Field label="Phone (optional)" name="phone" placeholder="(555) 555-5555" />
            </div>

            <label className="block mt-4">
              <div className="text-xs text-white/60 mb-2">What are you interested in? (optional)</div>
              <select
                name="interest"
                className={`w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white ${FOCUS}`}
                defaultValue="retail"
              >
                <option value="retail">Retail nodes</option>
                <option value="healthoi">HealthOI (AH2)</option>
                <option value="shopoi">ShopOI</option>
                <option value="factcheckoi">FactCheckOI</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="block mt-4">
              <div className="text-xs text-white/60 mb-2">Message (optional)</div>
              <textarea
                name="message"
                rows={4}
                placeholder="Tell us what you want to accomplish…"
                className={`w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 ${FOCUS}`}
              />
            </label>

            <div className="mt-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="text-xs text-white/50">
                By submitting, you agree to be contacted about OptinodeOI access.
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90 transition-colors"
              >
                Submit request
              </button>
            </div>
          </form>
        </div>

        {/* Secondary actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <a className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors" href="/oi/waitlist">
            <div className="text-sm font-semibold">Join waitlist</div>
            <div className="text-xs text-white/60 mt-1">Lightweight email-only option</div>
          </a>
          <a className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors" href="/oi/compare">
            <div className="text-sm font-semibold">Product compare</div>
            <div className="text-xs text-white/60 mt-1">See public demo output</div>
          </a>
          <a className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors" href="/oi/nodes">
            <div className="text-sm font-semibold">Public nodes</div>
            <div className="text-xs text-white/60 mt-1">What’s currently installed</div>
          </a>
        </div>
      </div>
    </div>
  );
}
