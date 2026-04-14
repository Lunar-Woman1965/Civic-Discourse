import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support Bridging the Aisle',
  description: 'Support Bridging the Aisle, an independent, nonpartisan civic discussion platform. Voluntary contributions help fund hosting, development, security, moderation, and operating costs.',
};

export default function SupportPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#DBD4C8', color: '#2C1810' }}>
      <div className="mx-auto max-w-4xl px-6 py-12 md:px-8 md:py-16">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ color: '#2C1810' }}>Support Bridging the Aisle</h1>
          <p className="mt-4 text-base leading-7 md:text-lg" style={{ color: '#2C1810' }}>Bridging the Aisle is an independent, nonpartisan civic discussion platform.</p>
          <p className="mt-4 text-base leading-7 md:text-lg" style={{ color: '#2C1810' }}>It exists to support respectful, fact-based dialogue across political differences.</p>
          <p className="mt-4 text-base leading-7 md:text-lg" style={{ color: '#2C1810' }}>Voluntary contributions help cover the costs of operating and maintaining the platform.</p>
        </header>
        <section className="mb-10 rounded-2xl border p-6" style={{ borderColor: '#2C1810', backgroundColor: 'rgba(44,24,16,0.06)' }}>
          <h2 className="text-xl font-semibold" style={{ color: '#2C1810' }}>What contributions support</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7" style={{ color: '#2C1810' }}>
            <li>website hosting</li>
            <li>software development</li>
            <li>maintenance and technical support</li>
            <li>security and infrastructure</li>
            <li>moderation tools and moderation support</li>
            <li>general operating costs</li>
          </ul>
        </section>
        <section className="mb-10">
          <h2 className="text-xl font-semibold" style={{ color: '#2C1810' }}>What contributions are not</h2>
          <p className="mt-4 text-base leading-7" style={{ color: '#2C1810' }}>A contribution to Bridging the Aisle is:</p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7" style={{ color: '#2C1810' }}>
            <li>not a charitable donation</li>
            <li>not tax-deductible</li>
            <li>not a campaign contribution</li>
            <li>not a payment to a political action committee (PAC) or Super PAC</li>
            <li>not lobbying support</li>
            <li>not payment for political influence</li>
            <li>not advocacy funding</li>
            <li>not an investment or financial product</li>
            <li>not the purchase of physical goods</li>
            <li>not a membership fee required for access or participation</li>
            <li>not a payment for special access, preferred treatment, enhanced visibility, or control over platform decisions</li>
          </ul>
          <p className="mt-4 text-base leading-7 font-medium" style={{ color: '#2C1810' }}>Support helps sustain the platform. It does not buy influence.</p>
        </section>
        <section className="mb-10">
          <h2 className="text-xl font-semibold" style={{ color: '#2C1810' }}>What contributors receive</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7" style={{ color: '#2C1810' }}>
            <li>no physical goods</li>
            <li>no political access or influence</li>
            <li>no lobbying services</li>
            <li>no preferential moderation treatment</li>
            <li>no enhanced platform privileges</li>
            <li>no guaranteed visibility or placement</li>
            <li>no guaranteed implementation of suggestions</li>
            <li>no ownership, equity, or financial return</li>
            <li>no control over platform features, moderation, or platform decisions</li>
          </ul>
          <p className="mt-4 text-base leading-7" style={{ color: '#2C1810' }}>Contributions are optional and support platform operations only.</p>
        </section>
        <section className="mb-10">
          <h2 className="text-xl font-semibold" style={{ color: '#2C1810' }}>Platform access</h2>
          <p className="mt-4 text-base leading-7" style={{ color: '#2C1810' }}>Support is voluntary.</p>
          <p className="mt-4 text-base leading-7" style={{ color: '#2C1810' }}>People are not required to contribute in order to visit, read, participate, or support the mission of Bridging the Aisle.</p>
        </section>
        <section className="mb-10">
          <h2 className="text-xl font-semibold" style={{ color: '#2C1810' }}>Independence and nonpartisanship</h2>
          <p className="mt-4 text-base leading-7" style={{ color: '#2C1810' }}>Bridging the Aisle is not affiliated with any political party, candidate, campaign, political action committee (PAC), Super PAC, lobbying organization, or advocacy fund.</p>
          <p className="mt-4 text-base leading-7" style={{ color: '#2C1810' }}>It does not sell political influence or access.</p>
          <p className="mt-4 text-base leading-7" style={{ color: '#2C1810' }}>Its purpose is to provide an independent space for civic discussion across differences.</p>
        </section>
        <section className="mb-10 rounded-2xl border p-6" style={{ borderColor: '#2C1810', backgroundColor: 'rgba(44,24,16,0.06)' }}>
          <h2 className="text-xl font-semibold" style={{ color: '#2C1810' }}>Compliance summary</h2>
          <p className="mt-4 text-base leading-7" style={{ color: '#2C1810' }}><strong>Business description:</strong> Bridging the Aisle is an independent, nonpartisan civic discussion platform. Voluntary contributions support hosting, software development, maintenance, security, infrastructure, moderation, and general operating costs. Contributions are not charitable donations, campaign contributions, payments to PACs or Super PACs, lobbying support, advocacy funding, investment products, purchases of physical goods, or payments for political influence, special access, preferred treatment, enhanced visibility, or control over platform decisions.</p>
        </section>
        <section className="mb-10 rounded-2xl border p-8 text-center" style={{ borderColor: '#2C1810', backgroundColor: 'rgba(44,24,16,0.06)' }}>
          <h2 className="text-xl font-semibold" style={{ color: '#2C1810' }}>Support Bridging the Aisle</h2>
          <p className="mt-4 text-base leading-7" style={{ color: '#2C1810' }}>Voluntary contributions help fund hosting, development, maintenance, security, infrastructure, moderation, and general operating costs.</p>
          <p className="mt-2 text-sm leading-6" style={{ color: '#2C1810' }}>Contributions support platform operations only and do not confer political influence, access, or special privileges.</p>
          <div className="mt-8">
            <a href="https://www.buymeacoffee.com/bta.civic.discussion" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold shadow-md transition hover:opacity-90" style={{ backgroundColor: '#2C1810', color: '#DBD4C8' }}>
              ☕ Make a Voluntary Contribution
            </a>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-semibold" style={{ color: '#2C1810' }}>Contact</h2>
          <p className="mt-4 text-base leading-7" style={{ color: '#2C1810' }}>Questions about supporting Bridging the Aisle may be directed to:</p>
          <p className="mt-4 text-base font-medium" style={{ color: '#2C1810' }}>assistBTA@bridgingtheaisle.com</p>
        </section>
      </div>
    </main>
  );
}

