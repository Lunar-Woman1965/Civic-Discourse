'use client'

import Script from 'next/script'

export default function BMCWidget() {
  return (
    <Script
      src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
      data-name="BMC-Widget"
      data-cfasync="false"
      data-id="bta.civic.discussion"
      data-description="Support me on Buy me a coffee!"
      data-message="By supporting BTA, you're helping political discussions become and remain civil."
      data-color="#2C1810"
      data-position="Right"
      data-x_margin="18"
      data-y_margin="18"
      strategy="afterInteractive"
    />
  )
}