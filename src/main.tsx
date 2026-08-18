import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import ScrollExpand from './ScrollExpand'
import MaskedHeading from './MaskedHeading'
import AccordionGallery from './AccordionGallery'

type Club = {
  id: string
  name: string
  english: string
  category: string
  grades: string
  time: string
  place: string
  teacher: string
  phone?: string
  summary: string
  description: string
  color: string
  photos: string[]
}

const schoolGateImage = `${import.meta.env.BASE_URL}school-gate.jpg`
const schoolLogoImage = `${import.meta.env.BASE_URL}danfeng-school-logo.jpg`

const Icon = ({ name, size = 20 }: { name: string; size?: number }) => {
  const paths: Record<string, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    arrow: <path d="m9 18 6-6-6-6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    plus: <path d="M12 5v14M5 12h14"/>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 15-5-5L5 20"/></>,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/>,
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{paths[name]}</svg>
}

function art(label: string, a: string, b: string, motif = '○') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><filter id="n"><feTurbulence baseFrequency=".65" numOctaves="3" stitchTiles="stitch"/><feBlend in="SourceGraphic" mode="soft-light"/></filter></defs><rect width="1200" height="800" fill="url(#g)"/><circle cx="950" cy="130" r="280" fill="white" opacity=".12"/><circle cx="180" cy="700" r="320" fill="white" opacity=".09"/><text x="90" y="190" font-size="160" fill="white" opacity=".28">${motif}</text><text x="90" y="650" font-family="sans-serif" font-size="72" font-weight="700" fill="white">${label}</text><rect width="1200" height="800" opacity=".12" filter="url(#n)"/></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const starterClubs: Club[] = [
  { id: 'astronomy', name: '天文观测社', english: 'ASTRONOMY CLUB', category: '科学探索', grades: '初一 — 高二', time: '每周五 16:30 — 18:00', place: '科技楼天文台', teacher: '陈明远 老师', summary: '仰望星空，从好奇心出发，一起记录宇宙的浪漫。', description: '我们用望远镜认识星座，学习基础的天文摄影与数据记录。每学期安排校外观星活动，也会把有趣的天文现象做成校园科普展。不需要基础，只需要你对头顶的星空保持好奇。', color: '#4b5fa8', photos: [art('星空观测夜', '#24345f', '#8a6eaa', '✷'), art('天文摄影分享', '#17283e', '#4e8d8b', '◌'), art('校园科普展', '#65537e', '#d38370', '✦')] },
  { id: 'pottery', name: '陶艺与手作社', english: 'CERAMICS CLUB', category: '艺术创作', grades: '初一 — 高三', time: '每周三 16:20 — 17:50', place: '艺术中心 203', teacher: '林静 老师', summary: '用双手和泥土对话，让每一件作品都有自己的温度。', description: '从拉坯、手捏到上釉，我们在慢下来的创作里感受材料的力量。社团每月会设定一个小主题，优秀作品将在校园艺廊展出。', color: '#b36e4a', photos: [art('手作陶盘', '#b66f4e', '#e0ad78', '◡'), art('拉坯体验', '#81604c', '#c99b77', '◎'), art('学期作品展', '#a74738', '#dd9f78', '◇')] },
  { id: 'basketball', name: '热血篮球社', english: 'BASKETBALL CLUB', category: '体育运动', grades: '初二 — 高三', time: '每周二、四 17:00 — 18:30', place: '西区室内篮球馆', teacher: '周伟 老师', summary: '技术、配合和热爱，在每一次传球中成为更好的队友。', description: '社团按基础进行分组训练，包含基本功、战术配合和体能训练。我们会组织年级联赛，也会代表学校参加区级比赛。', color: '#cf6947', photos: [art('校园联赛', '#c95032', '#efac55', '●'), art('训练日常', '#273a50', '#b75a42', '↗'), art('团队时刻', '#6d3932', '#cf7651', '★')] },
  { id: 'choir', name: '风铃合唱团', english: 'CHOIR CLUB', category: '音乐表演', grades: '初一 — 高三', time: '每周一 16:30 — 18:00', place: '音乐厅', teacher: '赵云 老师', summary: '把不同的声音放在一起，听见和谐，也听见彼此。', description: '每周进行发声、视唱练耳与曲目排练。无论你是否有舞台经验，都能在合唱中找到属于自己的位置。', color: '#86628e', photos: [art('新年音乐会', '#5d456d', '#b67b8e', '♫'), art('日常排练', '#794d67', '#d99a91', '♪')] },
  { id: 'robot', name: '机器人创客社', english: 'ROBOTICS CLUB', category: '科学探索', grades: '初二 — 高二', time: '每周六 09:00 — 11:30', place: '创客实验室', teacher: '高博 老师', summary: '从一个想法开始，用代码和零件把它变成会动的作品。', description: '学习机械结构、传感器和图形化编程，以小组方式完成真实项目。从入门小车到校园创新大赛，让每个点子都有被实现的可能。', color: '#297d77', photos: [art('智能小车', '#246d68', '#66aaa1', '⌘'), art('创客挑战赛', '#314c5a', '#45a58f', '⚙')] },
  { id: 'drama', name: '小剧场戏剧社', english: 'DRAMA CLUB', category: '音乐表演', grades: '初一 — 高二', time: '每周四 16:30 — 18:00', place: '小剧场', teacher: '苏晓 老师', summary: '在灯光亮起之前，我们练习表达，想象与共情。', description: '从即兴游戏、台词训练到舞台创作，每个人都可以是演员、编剧或舞台工作者。每学年我们会共同完成一部原创校园剧。', color: '#a74f56', photos: [art('原创校园剧', '#713d55', '#bd655d', '△'), art('舞台工作坊', '#483543', '#b88965', '◇')] },
]

const storageKey = 'senyu-school-clubs-v1'
const signupQrKey = 'danfeng-signup-qr-v1'
const clubCategories = ['文艺中心', '体健中心', '科创中心'] as const
const categoryMap: Record<string, string> = { '艺术创作': '文艺中心', '音乐表演': '文艺中心', '体育运动': '体健中心', '科学探索': '科创中心', '文艺中心': '文艺中心', '体健中心': '体健中心', '科创中心': '科创中心' }
const normalizeClub = (club: Club): Club => ({ ...club, phone: club.phone || '', category: categoryMap[club.category] || '文艺中心' })
const emptyClub = (): Club => ({ id: crypto.randomUUID(), name: '', english: '', category: '文艺中心', grades: '', time: '', place: '', teacher: '', phone: '', summary: '', description: '', color: '#397c6b', photos: [] })
const categoryTheme = (category: string) => category === '文艺中心'
  ? { color: '#c76f3f', tint: 'rgba(184, 84, 36, .52)', fallback: '#e2a06b' }
  : category === '体健中心'
    ? { color: '#397756', tint: 'rgba(35, 104, 65, .52)', fallback: '#79a77b' }
    : { color: '#3f6f9f', tint: 'rgba(38, 89, 145, .54)', fallback: '#79a9cd' }

function App() {
  const [clubs, setClubs] = useState<Club[]>(() => {
    try { return (JSON.parse(localStorage.getItem(storageKey) || 'null') || starterClubs).map(normalizeClub) } catch { return starterClubs.map(normalizeClub) }
  })
  const [selectedId, setSelectedId] = useState(clubs[0]?.id || '')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('全部社团')
  const [editing, setEditing] = useState<Club | null>(null)
  const [signupQr, setSignupQr] = useState(() => localStorage.getItem(signupQrKey) || '')
  const [mobileNav, setMobileNav] = useState(false)
  const selected = clubs.find(club => club.id === selectedId) || clubs[0]
  const categories = ['全部社团', ...clubCategories]
  const filtered = useMemo(() => clubs.filter(club => (category === '全部社团' || club.category === category) && `${club.name}${club.description}`.toLowerCase().includes(query.toLowerCase())), [clubs, query, category])

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(clubs)) }, [clubs])
  useEffect(() => { signupQr ? localStorage.setItem(signupQrKey, signupQr) : localStorage.removeItem(signupQrKey) }, [signupQr])
  useEffect(() => { if (filtered.length && !filtered.some(c => c.id === selectedId)) setSelectedId(filtered[0].id) }, [filtered, selectedId])

  const saveClub = (event: FormEvent) => {
    event.preventDefault()
    if (!editing) return
    setClubs(current => current.some(c => c.id === editing.id) ? current.map(c => c.id === editing.id ? editing : c) : [...current, editing])
    setSelectedId(editing.id)
    setEditing(null)
  }

  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    if (!editing || !event.target.files) return
    Array.from(event.target.files).slice(0, 8 - editing.photos.length).forEach(file => {
      const reader = new FileReader()
      reader.onload = () => setEditing(current => current ? { ...current, photos: [...current.photos, String(reader.result)] } : current)
      reader.readAsDataURL(file)
    })
  }

  const uploadSignupQr = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setSignupQr(String(reader.result))
    reader.readAsDataURL(file)
  }

  return <div className="site-shell">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="返回首页"><img className="brand-mark" src={schoolLogoImage} alt="杭州市丹枫实验小学校徽"/><span className="brand-copy"><strong>杭州市丹枫实验小学</strong><small>Hangzhou Danfeng Experimental Primary School</small></span></a>
      <nav className={mobileNav ? 'open' : ''}>
        <a className="active" href="#clubs" onClick={() => setMobileNav(false)}>社团导览</a>
        <a href="#about" onClick={() => setMobileNav(false)}>关于社团</a>
        <a href="#join" onClick={() => setMobileNav(false)}>加入指南</a>
      </nav>
      <button className="manage-button" onClick={() => setEditing(selected ? { ...selected, photos: [...selected.photos] } : emptyClub())}><Icon name="edit" size={17}/><span>内容管理</span></button>
      <button className="menu-button" onClick={() => setMobileNav(!mobileNav)} aria-label="菜单"><Icon name={mobileNav ? 'close' : 'menu'}/></button>
    </header>

    <main id="top">
      <section id="about">
        <ScrollExpand src={schoolGateImage} alt="杭州市丹枫实验小学校门" title={<div className="scroll-expand__title-inner"><MaskedHeading text="丹枫少年宫" src={schoolGateImage} tag="div" className="scroll-expand__masked-title"/><span>在热爱里<br/><em>遇见同伴</em></span></div>} scrollHint="向下滚动 · 展开校园" startWidth={90} startHeight={68} mediaZoom={1.16} scrollDistance={.5} holdDistance={.04}>
          <MaskedHeading text="丹枫少年宫" src={schoolGateImage} tag="div" reveal="wipe" className="scroll-expand__overlay-brand"/>
          <p className="kicker">FIND YOUR FRIENDS</p>
          <h2>在热爱里<br/><em>遇见同伴</em></h2>
          <p>每一种好奇都值得被看见。<br/>走进社团，发现不一样的校园生活。</p>
          <div className="scroll-expand__count"><b>{clubs.length.toString().padStart(2, '0')}</b><span>个社团<br/>等你加入</span></div>
        </ScrollExpand>
      </section>

      <section className="club-section" id="clubs">
        <div className="section-heading"><div><p className="kicker">EXPLORE CLUBS</p><h2>探索校园社团</h2></div><p>从科学到艺术，从运动到公益<br/>找到最适合你的那一个。</p></div>
        <div className="toolbar">
          <div className="category-tabs">{categories.map(item => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
          <label className="search"><Icon name="search" size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索社团..."/></label>
        </div>

        <div className="club-layout">
          <div className="club-list">
            {filtered.map((club, index) => <button key={club.id} className={`club-card ${selected?.id === club.id ? 'selected' : ''}`} onClick={() => setSelectedId(club.id)} style={{ '--club': club.color } as React.CSSProperties}>
              <div className="card-number">{String(index + 1).padStart(2, '0')}</div><div className="card-copy"><span>{club.category}</span><h3>{club.name}</h3><p>{club.description}</p></div><div className="card-arrow"><Icon name="arrow"/></div>
            </button>)}
            {!filtered.length && <div className="empty-result">没有找到符合条件的社团，试试其他关键词吧。</div>}
          </div>

          {selected && <article className="club-detail" style={{ '--club': categoryTheme(selected.category).color } as React.CSSProperties}>
            <div className="detail-cover" style={{ backgroundColor: categoryTheme(selected.category).fallback, backgroundImage: `linear-gradient(180deg, ${categoryTheme(selected.category).tint.replace('.52', '.12').replace('.54', '.14')} 0%, transparent 42%, ${categoryTheme(selected.category).tint} 100%), url(${selected.photos[0] || art(selected.name, categoryTheme(selected.category).color, categoryTheme(selected.category).fallback)})` }}><span>{selected.category}</span><button onClick={() => setEditing({ ...selected, photos: [...selected.photos] })}><Icon name="edit" size={16}/>编辑资料</button><div><h2>{selected.name}</h2></div></div>
            <div className="fact-grid">
              <div><Icon name="user"/><span><small>面向年级</small><b>{selected.grades}</b></span></div>
              <div><Icon name="clock"/><span><small>上课时间</small><b>{selected.time}</b></span></div>
              <div><Icon name="pin"/><span><small>上课地点</small><b>{selected.place}</b></span></div>
              <div><Icon name="user"/><span><small>校内管理老师</small><b>{selected.teacher}</b></span></div>
              <div><Icon name="phone"/><span><small>联系电话</small><b>{selected.phone || '待补充'}</b></span></div>
            </div>
            <div className="story"><p className="kicker">ABOUT THE CLUB</p><h3>关于我们</h3><p>{selected.description}</p></div>
            <div className="gallery-heading"><div><p className="kicker">CLUB MOMENTS</p><h3>社团瞬间</h3></div><span>{selected.photos.length} 张照片</span></div>
            <div className="gallery-accordion"><AccordionGallery items={selected.photos.map((photo, index) => ({ image: photo, alt: `${selected.name}活动照片 ${index + 1}` }))} defaultIndex={Math.min(1, selected.photos.length - 1)} accentColor={categoryTheme(selected.category).fallback}/></div>
          </article>}
        </div>
      </section>

      <section className="join" id="join"><p className="kicker">START YOUR JOURNEY</p><h2>准备好开始你的<br/>社团旅程了吗？</h2><p>记下喜欢的社团，请扫码报名吧。</p><div className={`signup-qr${signupQr ? ' has-image' : ''}`}>{signupQr ? <img src={signupQr} alt="社团报名二维码"/> : <span><Icon name="image" size={24}/><b>报名二维码</b><small>请在内容管理中上传</small></span>}</div><a href="#clubs">回到社团导览 <Icon name="arrow" size={17}/></a></section>
    </main>

    <footer><div className="brand"><img className="brand-mark" src={schoolLogoImage} alt=""/><span className="brand-copy"><strong>杭州市丹枫实验小学</strong><small>Hangzhou Danfeng Experimental Primary School</small></span></div><p>让每一份热爱，都在校园里找到回声。</p><small>© 2026 杭州市丹枫实验小学</small></footer>

    {editing && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setEditing(null)}>
      <form className="editor" onSubmit={saveClub}>
        <div className="editor-head"><div><p className="kicker">CONTENT MANAGER</p><h2>{clubs.some(c => c.id === editing.id) ? '编辑社团资料' : '新增社团'}</h2></div><button type="button" onClick={() => setEditing(null)}><Icon name="close"/></button></div>
        <div className="form-grid">
          <label><span>社团名称</span><input required value={editing.name} onChange={e => setEditing({...editing, name: e.target.value})}/></label>
          <label><span>社团分类</span><select required value={editing.category} onChange={e => setEditing({...editing, category: e.target.value})}>{clubCategories.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
          <label><span>面向年级</span><input required value={editing.grades} onChange={e => setEditing({...editing, grades: e.target.value})}/></label>
          <label><span>上课时间</span><input required value={editing.time} onChange={e => setEditing({...editing, time: e.target.value})}/></label>
          <label><span>上课地点</span><input required value={editing.place} onChange={e => setEditing({...editing, place: e.target.value})}/></label>
          <label><span>校内管理老师</span><input required value={editing.teacher} onChange={e => setEditing({...editing, teacher: e.target.value})}/></label>
          <label><span>联系电话</span><input type="tel" value={editing.phone || ''} onChange={e => setEditing({...editing, phone: e.target.value})}/></label>
          <label><span>主题颜色</span><input type="color" value={editing.color} onChange={e => setEditing({...editing, color: e.target.value})}/></label>
          <label className="wide"><span>社团介绍</span><textarea required rows={5} value={editing.description} onChange={e => setEditing({...editing, description: e.target.value})}/></label>
        </div>
        <div className="photo-editor"><div><b>社团活动照片</b><small>最多 8 张，第 1 张将作为封面图。图片会保存在当前浏览器中。</small></div><label className="upload"><Icon name="image"/>上传照片<input type="file" accept="image/*" multiple onChange={upload}/></label></div>
        <div className="photo-strip">{editing.photos.map((photo, index) => <div key={`${photo.slice(-16)}${index}`}><img src={photo} alt=""/><button type="button" onClick={() => setEditing({...editing, photos: editing.photos.filter((_, i) => i !== index)})}><Icon name="close" size={15}/></button></div>)}</div>
        <div className="signup-editor"><div><b>报名二维码</b><small>用于页面底部的扫码报名区域，建议上传正方形图片。</small></div>{signupQr && <img src={signupQr} alt="当前报名二维码"/>}<label className="upload"><Icon name="image"/>{signupQr ? '替换图片' : '上传图片'}<input type="file" accept="image/*" onChange={uploadSignupQr}/></label>{signupQr && <button type="button" className="remove-qr" onClick={() => setSignupQr('')}>移除</button>}</div>
        <div className="editor-actions">
          {clubs.some(c => c.id === editing.id) && <button type="button" className="delete" onClick={() => { if (confirm('确定删除这个社团吗？')) { const next = clubs.filter(c => c.id !== editing.id); setClubs(next); setSelectedId(next[0]?.id || ''); setEditing(null) } }}>删除社团</button>}
          <button type="button" className="new" onClick={() => setEditing(emptyClub())}><Icon name="plus" size={17}/>新增社团</button><button type="submit" className="save">保存并发布</button>
        </div>
      </form>
    </div>}
  </div>
}

createRoot(document.getElementById('root')!).render(<App />)
