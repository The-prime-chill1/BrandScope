<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>BRANDSCOPE Sitemap</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { margin: 0; background: #f4f7fb; color: #10243a; font: 15px Inter, Arial, sans-serif; }
          main { width: min(1080px, calc(100% - 32px)); margin: 48px auto; }
          header { padding: 28px; border-radius: 18px; color: white; background: linear-gradient(135deg, #10243a, #3157d5); box-shadow: 0 18px 45px rgba(16,36,58,.16); }
          h1 { margin: 0 0 8px; font-size: clamp(28px, 5vw, 44px); }
          p { margin: 0; color: #dbeafe; }
          .count { display: inline-block; margin-top: 18px; padding: 7px 12px; border: 1px solid rgba(255,255,255,.25); border-radius: 999px; background: rgba(255,255,255,.1); }
          table { width: 100%; margin-top: 24px; border-collapse: collapse; overflow: hidden; border-radius: 14px; background: white; box-shadow: 0 12px 32px rgba(16,36,58,.08); }
          th, td { padding: 14px 16px; border-bottom: 1px solid #e7edf5; text-align: left; }
          th { color: #53657a; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; background: #f8fafc; }
          a { color: #3157d5; font-weight: 600; text-decoration: none; word-break: break-all; }
          a:hover { text-decoration: underline; }
          tr:last-child td { border-bottom: 0; }
          @media (max-width: 700px) { main { margin: 20px auto; } header { padding: 22px; } th:nth-child(n+2), td:nth-child(n+2) { display: none; } }
        </style>
      </head>
      <body>
        <main>
          <header>
            <h1>BRANDSCOPE Sitemap</h1>
            <p>Where Brands Get Discovered. Built and powered by CHILL TECH LTD.</p>
            <span class="count"><xsl:value-of select="count(sm:urlset/sm:url)" /> public URLs</span>
          </header>
          <table>
            <thead><tr><th>URL</th><th>Last updated</th><th>Frequency</th><th>Priority</th></tr></thead>
            <tbody>
              <xsl:for-each select="sm:urlset/sm:url">
                <tr>
                  <td><a href="{sm:loc}"><xsl:value-of select="sm:loc" /></a></td>
                  <td><xsl:value-of select="sm:lastmod" /></td>
                  <td><xsl:value-of select="sm:changefreq" /></td>
                  <td><xsl:value-of select="sm:priority" /></td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
