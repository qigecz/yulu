export default function LandingPage() {
  return (
    <>
      <header className="topnav">
        <div className="container topnav-inner">
          <span className="logo">渔路 YULU</span>
          <nav>
            <a href="#features">功能</a>
            <a href="#how">使用方式</a>
            <a href="#community">社区</a>
          </nav>
          <button className="btn btn-primary">免费下载</button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="section hero">
          <div className="container hero-center">
            <p className="eyebrow">钓鱼人的专属地图</p>
            <h1>发现你的下一个钓点</h1>
            <p className="lead">精准标注坑点坐标，下载离线路线导航，和钓友分享每一次收获。从溪流到湖泊，从路亚到台钓——渔路陪你找到水边的秘密。</p>
            <div className="hero-cta">
              <button className="btn btn-primary">下载 App</button>
              <button className="btn btn-secondary">了解更多</button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section" id="features">
          <div className="container stack" style={{ gap: '56px' }}>
            <div style={{ maxWidth: '36ch' }}>
              <p className="eyebrow">核心功能</p>
              <h2>三个理由让钓友离不开渔路。</h2>
            </div>
            <div className="grid-3">
              <div className="feature">
                <div className="feature-mark">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <h3>精准坑点标注</h3>
                <p>上传钓点坐标，标注水深、鱼种、最佳时段。每个坑点都是一次真实作钓的记录，让后来者少走弯路。</p>
              </div>
              <div className="feature">
                <div className="feature-mark" style={{ color: 'var(--muted)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                </div>
                <h3>路线下载导航</h3>
                <p>下载钓友分享的坑点路线，支持离线导航。无信号的山野水库，也能找到通往钓位的路。</p>
              </div>
              <div className="feature">
                <div className="feature-mark" style={{ color: 'var(--muted)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <h3>社区教学分享</h3>
                <p>观看路亚抛竿教学、台钓调漂技巧。分享你的作钓心得和坑点路线，帮新手快速上手，和老手切磋经验。</p>
              </div>
            </div>
          </div>
        </section>

        {/* App Preview */}
        <section className="section">
          <div className="container hero-split">
            <div>
              <p className="eyebrow">产品预览</p>
              <h2>坑点路线，尽在掌中。</h2>
              <p className="lead" style={{ marginTop: '20px' }}>打开渔路，附近的优质钓点一目了然。点开任意坑点查看详情、下载路线、离线导航直达。还能看到其他钓友的最近收获和评价。</p>
              <div className="hero-cta" style={{ marginTop: '28px' }}>
                <button className="btn btn-primary">下载体验</button>
                <button className="btn btn-ghost btn-arrow">查看所有功能</button>
              </div>
            </div>
            <div className="phone-frame" aria-label="App 预览">
              <span className="island" aria-hidden="true" />
              <div className="screen-content">
                <div className="mini-status">
                  <span>9:41</span>
                  <span style={{ fontSize: '9px' }}>WiFi</span>
                </div>
                <div className="mini-body">
                  <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>周三 · 晴 26°C</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, letterSpacing: '-0.02em' }}>你好，钓友</div>
                  <div className="mini-search">搜索钓点、路线、教程…</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, marginTop: '4px' }}>附近热门钓点</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <div className="mini-card">
                      <div className="mini-bar" style={{ width: '60%' }} />
                      <div style={{ fontSize: '10px', fontWeight: 600 }}>千岛湖 · 碧溪湾</div>
                      <div style={{ fontSize: '8px', color: 'var(--muted)' }}>2.3km · 鲈鱼 · 路亚</div>
                    </div>
                    <div className="mini-card">
                      <div className="mini-bar" style={{ width: '40%', background: 'var(--fg-soft)' }} />
                      <div style={{ fontSize: '10px', fontWeight: 600 }}>富春江 · 钓台</div>
                      <div style={{ fontSize: '8px', color: 'var(--muted)' }}>5.1km · 鲫鱼 · 台钓</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, marginTop: '2px' }}>最新路线</div>
                  <div className="mini-card" style={{ padding: '8px 10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 600 }}>密云水库北岸环线</div>
                        <div style={{ fontSize: '8px', color: 'var(--muted)' }}>12 坑点 · 18.5km</div>
                      </div>
                      <span className="pill" style={{ fontSize: '7px', padding: '2px 6px' }}>下载</span>
                    </div>
                  </div>
                  <div className="mini-card" style={{ padding: '8px 10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 600 }}>太湖东山半岛路线</div>
                        <div style={{ fontSize: '8px', color: 'var(--muted)' }}>8 坑点 · 9.2km</div>
                      </div>
                      <span className="pill" style={{ fontSize: '7px', padding: '2px 6px' }}>下载</span>
                    </div>
                  </div>
                </div>
                <div className="mini-tabbar">
                  <div className="mini-tab active">
                    <svg viewBox="0 0 24 24"><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg>首页
                  </div>
                  <div className="mini-tab">
                    <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>坑点
                  </div>
                  <div className="mini-tab">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>导航
                  </div>
                  <div className="mini-tab">
                    <svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>学习
                  </div>
                  <div className="mini-tab">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>我的
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="section" id="how">
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '36ch', margin: '0 auto 56px' }}>
              <p className="eyebrow">使用方式</p>
              <h2>三步开始你的钓鱼旅程。</h2>
            </div>
            <div className="step-flow">
              <div className="step">
                <h3>发现坑点</h3>
                <p>打开地图，查看附近钓友上传的坑点。按鱼种、距离、评分筛选，找到适合你的钓位。</p>
              </div>
              <div className="step">
                <h3>下载路线</h3>
                <p>选择目标坑点路线，一键下载离线地图。即使没有手机信号，也能沿着路线导航到达。</p>
              </div>
              <div className="step">
                <h3>分享经验</h3>
                <p>记录你的作钓成果，标注坑点信息，分享路线和技巧。帮更多钓友找到属于他们的鱼。</p>
              </div>
            </div>
          </div>
        </section>

        {/* Community */}
        <section className="section" id="community">
          <div className="container" style={{ maxWidth: '800px' }}>
            <div className="quote-mark">&ldquo;</div>
            <blockquote className="quote">以前到一个新水库，全靠运气找钓位。现在用渔路下载别人的路线，直接到坑点，省了至少两小时探路时间。</blockquote>
            <p className="quote-author">— 老张，路亚钓友 · 浙江千岛湖</p>
          </div>
        </section>

        {/* CTA */}
        <section className="section" style={{ textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: '600px' }}>
            <h2>开始你的钓鱼旅程。</h2>
            <p className="lead" style={{ margin: '16px auto 32px' }}>免费下载，立即发现附近钓点。</p>
            <div className="hero-cta" style={{ justifyContent: 'center' }}>
              <button className="btn btn-primary">下载 iOS 版</button>
              <button className="btn btn-secondary">下载 Android 版</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="pagefoot">
        <div className="container row-between">
          <span>&copy; 渔路 YULU · 2026</span>
          <span className="meta">钓鱼人的专属地图 · hello@yulu.app</span>
        </div>
      </footer>
    </>
  );
}
