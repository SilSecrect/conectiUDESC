import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, BookOpen, CheckCircle2, ChevronDown, CircleUserRound,
  Eye, FileText, Filter, GraduationCap, LogOut, Menu, Newspaper, Plus,
  Search, ShieldCheck, Trash2, Users, X, Pencil, CalendarDays, UserPlus, Save
} from 'lucide-react'

const STORAGE_KEYS = {
  news: 'conectiudesc_noticias_v2',
  users: 'conectiudesc_usuarios_v2',
  session: 'conectiudesc_sessao_v2',
}

const CENTROS = [
  'Todos os centros', 'Geral / UDESC', 'CEAD', 'FAED', 'CEART', 'ESAG', 'CEFID',
  'CCT', 'CAV', 'CEO', 'CERES', 'CEPLAN', 'CESFI', 'CEAVI'
]

// Doze contas de demonstração: uma por centro. Somente o administrador
// consegue consultar e administrar esta lista dentro do aplicativo.
const INITIAL_USERS = [
  { id: 'admin-demo', nome: 'Administrador do sistema', email: 'admin@udesc.br', senha: '123456', perfil: 'admin', centro: null },
  { id: 'center-cead', nome: 'Noemi de Andrade', email: 'noemi@udesc.br', senha: '123456', perfil: 'conselheiro', centro: 'CEAD' },
  { id: 'center-faed', nome: 'Lucas Martins', email: 'lucas.faed@udesc.br', senha: '123456', perfil: 'estudante', centro: 'FAED' },
  { id: 'center-ceart', nome: 'Beatriz Costa', email: 'beatriz.ceart@udesc.br', senha: '123456', perfil: 'estudante', centro: 'CEART' },
  { id: 'center-esag', nome: 'Rafael Oliveira', email: 'rafael.esag@udesc.br', senha: '123456', perfil: 'estudante', centro: 'ESAG' },
  { id: 'center-cefid', nome: 'Camila Souza', email: 'camila.cefid@udesc.br', senha: '123456', perfil: 'estudante', centro: 'CEFID' },
  { id: 'center-cct', nome: 'Gabriel Santos', email: 'gabriel.cct@udesc.br', senha: '123456', perfil: 'estudante', centro: 'CCT' },
  { id: 'center-cav', nome: 'Mariana Alves', email: 'mariana.cav@udesc.br', senha: '123456', perfil: 'estudante', centro: 'CAV' },
  { id: 'center-ceo', nome: 'Pedro Henrique Lima', email: 'pedro.ceo@udesc.br', senha: '123456', perfil: 'estudante', centro: 'CEO' },
  { id: 'center-ceres', nome: 'Júlia Ferreira', email: 'julia.ceres@udesc.br', senha: '123456', perfil: 'estudante', centro: 'CERES' },
  { id: 'center-ceplan', nome: 'Matheus Rodrigues', email: 'matheus.ceplan@udesc.br', senha: '123456', perfil: 'estudante', centro: 'CEPLAN' },
  { id: 'center-cesfi', nome: 'Ana Clara Mendes', email: 'ana.cesfi@udesc.br', senha: '123456', perfil: 'estudante', centro: 'CESFI' },
  { id: 'center-ceavi', nome: 'Felipe Carvalho', email: 'felipe.ceavi@udesc.br', senha: '123456', perfil: 'estudante', centro: 'CEAVI' },
]

const INITIAL_NEWS = [
  {
    id: 'n1',
    titulo: 'Bem-vindos ao ConectiUDESC',
    resumo: 'Um espaço para acompanhar notícias, comunicados e informações dos centros da universidade.',
    conteudo: 'O ConectiUDESC reúne notícias acadêmicas em um único lugar. Use os filtros para consultar informações do seu centro ou acompanhar as publicações de toda a universidade.',
    categoria: 'Comunicados',
    centro: 'CEAD',
    autorId: 'center-cead',
    autorNome: 'Noemi de Andrade',
    data: '2026-10-18T09:00:00.000Z',
    fixada: true,
  },
  {
    id: 'n2',
    titulo: 'Acompanhe as notícias dos centros universitários',
    resumo: 'O fórum permite consultar publicações de diferentes centros em uma única tela.',
    conteudo: 'Selecione um centro no filtro para ver as notícias específicas. Você também pode manter a opção “Todos os centros” para acompanhar o feed geral.',
    categoria: 'Informativos',
    centro: 'CEFID',
    autorId: 'center-cefid',
    autorNome: 'Camila Souza',
    data: '2026-10-17T12:00:00.000Z',
    fixada: false,
  },
]

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(value))
}

function profileLabel(profile) {
  if (profile === 'admin') return 'Administrador'
  if (profile === 'conselheiro') return 'Conselheiro'
  return 'Estudante'
}

function App() {
  const [users, setUsers] = useState(() => readStorage(STORAGE_KEYS.users, INITIAL_USERS))
  const [news, setNews] = useState(() => readStorage(STORAGE_KEYS.news, INITIAL_NEWS))
  const [session, setSession] = useState(() => readStorage(STORAGE_KEYS.session, null))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [selectedCenter, setSelectedCenter] = useState('Todos os centros')
  const [category, setCategory] = useState('Todas as categorias')
  const [search, setSearch] = useState('')
  const [activeNews, setActiveNews] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingNews, setEditingNews] = useState(null)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [notice, setNotice] = useState('')
  const [activePage, setActivePage] = useState('news')

  useEffect(() => localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users)), [users])
  useEffect(() => localStorage.setItem(STORAGE_KEYS.news, JSON.stringify(news)), [news])
  useEffect(() => {
    if (session) localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session))
    else localStorage.removeItem(STORAGE_KEYS.session)
  }, [session])

  const canPublish = session?.perfil === 'admin' || session?.perfil === 'conselheiro'

  const visibleNews = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR')
    return [...news]
      .filter(item => selectedCenter === 'Todos os centros' || item.centro === selectedCenter || item.centro === 'Geral / UDESC')
      .filter(item => category === 'Todas as categorias' || item.categoria === category)
      .filter(item => !term || `${item.titulo} ${item.resumo} ${item.conteudo} ${item.centro} ${item.autorNome}`.toLocaleLowerCase('pt-BR').includes(term))
      .sort((a, b) => Number(Boolean(b.fixada)) - Number(Boolean(a.fixada)) || new Date(b.data) - new Date(a.data))
  }, [news, selectedCenter, category, search])

  function handleLogin(event) {
    event.preventDefault()
    const found = users.find(user => user.email.toLowerCase() === email.trim().toLowerCase() && user.senha === password)
    if (!found) {
      setLoginError('E-mail ou senha incorretos. Confira os dados ou solicite acesso ao administrador.')
      return
    }
    setSession({ id: found.id, nome: found.nome, email: found.email, perfil: found.perfil, centro: found.centro })
    setActivePage('news')
    setLoginError('')
  }

  function logout() {
    setSession(null)
    setActiveNews(null)
    setShowForm(false)
    setEditingNews(null)
  }

  function addUser(userData) {
    const normalizedEmail = userData.email.trim().toLowerCase()
    if (users.some(user => user.email.toLowerCase() === normalizedEmail)) {
      setNotice('Já existe um usuário com esse e-mail.')
      window.setTimeout(() => setNotice(''), 3000)
      return false
    }
    const newUser = { ...userData, id: `user-${Date.now()}`, email: normalizedEmail }
    setUsers(current => [...current, newUser])
    setNotice('Usuário cadastrado com sucesso.')
    window.setTimeout(() => setNotice(''), 3000)
    return true
  }

  function updateUser(updatedUser) {
    if (updatedUser.id === session.id && updatedUser.perfil !== 'admin') {
      setNotice('Por segurança, não é possível remover sua própria permissão de administrador.')
      window.setTimeout(() => setNotice(''), 3000)
      return false
    }
    if (users.some(user => user.id !== updatedUser.id && user.email.toLowerCase() === updatedUser.email.trim().toLowerCase())) {
      setNotice('Já existe outro usuário com esse e-mail.')
      window.setTimeout(() => setNotice(''), 3000)
      return false
    }
    if (updatedUser.perfil === 'admin' && updatedUser.centro) updatedUser = { ...updatedUser, centro: null }
    if (updatedUser.perfil !== 'admin' && !updatedUser.centro) {
      setNotice('Selecione o centro universitário para este usuário.')
      window.setTimeout(() => setNotice(''), 3000)
      return false
    }
    setUsers(current => current.map(user => user.id === updatedUser.id ? { ...user, ...updatedUser, email: updatedUser.email.trim().toLowerCase() } : user))
    if (updatedUser.id === session.id) {
      setSession(current => ({ ...current, nome: updatedUser.nome, email: updatedUser.email.trim().toLowerCase(), perfil: updatedUser.perfil, centro: updatedUser.centro }))
    }
    setNotice('Permissões do usuário atualizadas.')
    window.setTimeout(() => setNotice(''), 3000)
    return true
  }

  function removeUser(user) {
    if (user.id === session.id) {
      setNotice('Você não pode excluir sua própria conta enquanto estiver conectado.')
      window.setTimeout(() => setNotice(''), 3000)
      return
    }
    if (user.perfil === 'admin' && users.filter(item => item.perfil === 'admin').length <= 1) {
      setNotice('O sistema precisa manter pelo menos um administrador.')
      window.setTimeout(() => setNotice(''), 3000)
      return
    }
    if (window.confirm(`Deseja remover o usuário ${user.nome}?`)) {
      setUsers(current => current.filter(item => item.id !== user.id))
      setNotice('Usuário removido.')
      window.setTimeout(() => setNotice(''), 3000)
    }
  }

  function saveNews(formData) {
    // O centro do conselheiro vem do cadastro; ele não escolhe o centro manualmente.
    const centro = session.perfil === 'admin' ? 'Geral / UDESC' : session.centro
    const payload = {
      id: editingNews?.id || `n${Date.now()}`,
      titulo: formData.titulo.trim(),
      resumo: formData.resumo.trim(),
      conteudo: formData.conteudo.trim(),
      categoria: formData.categoria,
      centro,
      autorId: editingNews?.autorId || session.id,
      autorNome: editingNews?.autorNome || session.nome,
      data: editingNews?.data || new Date().toISOString(),
      fixada: Boolean(formData.fixada),
    }

    if (editingNews) {
      // Conselheiros só podem editar notícias próprias e do próprio centro.
      const permitted = session.perfil === 'admin' ||
        (editingNews.autorId === session.id && editingNews.centro === session.centro)
      if (!permitted) {
        setNotice('Você não tem permissão para editar esta publicação.')
        return
      }
      setNews(current => current.map(item => item.id === editingNews.id ? { ...payload, data: item.data, autorId: item.autorId, autorNome: item.autorNome } : item))
      setNotice('Notícia atualizada.')
    } else {
      setNews(current => [payload, ...current])
      setNotice('Notícia publicada com sucesso.')
    }
    setShowForm(false)
    setEditingNews(null)
    setActiveNews(null)
    setActivePage('news')
    window.setTimeout(() => setNotice(''), 3000)
  }

  function deleteNews(item) {
    const permitted = session?.perfil === 'admin' ||
      (session?.perfil === 'conselheiro' && item.autorId === session.id && item.centro === session.centro)
    if (!permitted) {
      setNotice('Você não tem permissão para excluir esta publicação.')
      return
    }
    if (window.confirm(`Deseja excluir a notícia "${item.titulo}"?`)) {
      setNews(current => current.filter(newsItem => newsItem.id !== item.id))
      setActiveNews(null)
      setNotice('Notícia excluída.')
      window.setTimeout(() => setNotice(''), 3000)
    }
  }

  function openEdit(item) {
    const permitted = session?.perfil === 'admin' ||
      (session?.perfil === 'conselheiro' && item.autorId === session.id && item.centro === session.centro)
    if (permitted) {
      setEditingNews(item)
      setShowForm(true)
      setActiveNews(null)
    }
  }

  if (!session) {
    return (
      <div className="login-layout">
        <section className="login-brand">
          <div className="brand-lockup">
            <div className="brand-mark"><GraduationCap size={30} /></div>
            <span>Conecti<strong>UDESC</strong></span>
          </div>
          <div className="login-brand-copy">
            <span className="eyebrow">INFORMAÇÃO • PARTICIPAÇÃO • CONEXÃO</span>
            <h1>A universidade<br />em conversa com você.</h1>
            <p>Notícias e comunicados dos centros universitários em um só lugar.</p>
          </div>
          <div className="brand-footer">Projeto acadêmico demonstrativo • React</div>
        </section>
        <main className="login-main">
          <form className="login-card" onSubmit={handleLogin}>
            <div className="mobile-brand"><div className="brand-mark"><GraduationCap size={25} /></div><span>Conecti<strong>UDESC</strong></span></div>
            <img className="udesc-logo-login" src="/udesc-logo.png" alt="UDESC — Universidade do Estado de Santa Catarina" />
            <span className="eyebrow">BEM-VINDO(A)</span>
            <h2>Entrar no fórum</h2>
            <p className="muted">Entre para consultar notícias e comunicados acadêmicos.</p>
            <label htmlFor="email">E-mail institucional (demonstração)</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nome@udesc.br" required />
            <label htmlFor="password">Senha</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Digite sua senha" required />
            {loginError && <div className="error-message">{loginError}</div>}
            <button className="button button-primary button-full" type="submit">Entrar <ArrowLeft className="button-arrow" size={17} /></button>
            <p className="fine-print">Protótipo acadêmico: o acesso demonstrativo não valida o ID UDESC real.</p>
          </form>
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup sidebar-brand">
          <div className="brand-mark"><GraduationCap size={27} /></div>
          <span>Conecti<strong>UDESC</strong></span>
          <button className="icon-button close-menu" onClick={() => setMobileMenu(false)} aria-label="Fechar menu"><X size={19} /></button>
        </div>
        <div className="sidebar-label">FÓRUM ACADÊMICO</div>
        <button className={`nav-link ${activePage === 'news' ? 'nav-link-active' : ''}`} onClick={() => { setActivePage('news'); setShowForm(false); setActiveNews(null); setMobileMenu(false) }}><Newspaper size={18} /> Notícias</button>
        {canPublish && <button className="nav-link" onClick={() => { setActivePage('news'); setEditingNews(null); setShowForm(true); setActiveNews(null); setMobileMenu(false) }}><Plus size={18} /> Publicar notícia</button>}
        {session.perfil === 'admin' && <button className={`nav-link ${activePage === 'users' ? 'nav-link-active' : ''}`} onClick={() => { setActivePage('users'); setShowForm(false); setActiveNews(null); setMobileMenu(false) }}><Users size={18} /> Usuários e permissões</button>}
        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar"><CircleUserRound size={21} /></div>
            <div className="user-mini-text"><strong>{session.nome}</strong><span>{profileLabel(session.perfil)}{session.centro ? ` • ${session.centro}` : ''}</span></div>
          </div>
          <button className="nav-link logout-link" onClick={logout}><LogOut size={18} /> Sair</button>
        </div>
      </aside>

      {mobileMenu && <button className="mobile-scrim" onClick={() => setMobileMenu(false)} aria-label="Fechar menu" />}

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="Abrir menu"><Menu size={21} /></button>
          <div className="breadcrumbs"><span>ConectiUDESC</span><span className="crumb-separator">/</span><strong>{activePage === 'users' ? 'Usuários e permissões' : showForm ? (editingNews ? 'Editar notícia' : 'Nova notícia') : activeNews ? 'Notícia' : 'Fórum de notícias'}</strong></div>
          <div className="topbar-actions">
            <span className="status-dot" /> <span className="status-label">Ambiente de demonstração</span>
            <div className="top-avatar"><CircleUserRound size={20} /></div>
          </div>
        </header>

        <div className="page-container">
          {notice && <div className="success-notice"><CheckCircle2 size={18} /> {notice}</div>}

          {activePage === 'users' && session.perfil === 'admin' ? (
            <UsersManager users={users} centers={CENTROS.filter(center => center !== 'Todos os centros')} currentUser={session} onAdd={addUser} onUpdate={updateUser} onRemove={removeUser} />
          ) : showForm ? (
            <NewsEditor
              initial={editingNews}
              session={session}
              onSave={saveNews}
              onCancel={() => { setShowForm(false); setEditingNews(null) }}
            />
          ) : activeNews ? (
            <article className="article-page">
              <button className="back-link" onClick={() => setActiveNews(null)}><ArrowLeft size={17} /> Voltar às notícias</button>
              <div className="article-hero">
                <div className="article-tags"><span className="tag">{activeNews.categoria}</span><span className="tag tag-center">{activeNews.centro}</span></div>
                <h1>{activeNews.titulo}</h1>
                <p className="article-summary">{activeNews.resumo}</p>
                <div className="article-meta"><span><CircleUserRound size={16} /> {activeNews.autorNome}</span><span><CalendarDays size={16} /> {formatDate(activeNews.data)}</span></div>
              </div>
              <div className="article-body"><p>{activeNews.conteudo}</p></div>
              {(session.perfil === 'admin' || (session.perfil === 'conselheiro' && activeNews.autorId === session.id && activeNews.centro === session.centro)) && (
                <div className="article-actions">
                  <button className="button button-secondary" onClick={() => openEdit(activeNews)}><Pencil size={16} /> Editar</button>
                  <button className="button button-danger" onClick={() => deleteNews(activeNews)}><Trash2 size={16} /> Excluir</button>
                </div>
              )}
              <div className="article-note"><ShieldCheck size={18} /><span>Publicação identificada no centro <strong>{activeNews.centro}</strong>, por {activeNews.autorNome}.</span></div>
            </article>
          ) : (
            <>
              <section className="welcome-row">
                <div>
                  <span className="eyebrow">INFORMAÇÃO QUE APROXIMA</span>
                  <h1>Fórum de notícias</h1>
                  <p>Acompanhe o que acontece nos centros universitários da UDESC.</p>
                </div>
                {canPublish && <button className="button button-primary publish-button" onClick={() => { setEditingNews(null); setShowForm(true) }}><Plus size={18} /> Nova publicação</button>}
              </section>

              <section className="welcome-banner">
                <div className="banner-icon"><BookOpen size={27} /></div>
                <div><strong>Um espaço, todos os centros.</strong><p>Consulte comunicados, decisões, eventos e notícias da comunidade acadêmica.</p></div>
                <div className="banner-decoration"><GraduationCap size={75} /></div>
              </section>

              <section className="stats-row">
                <div className="stat-card"><div className="stat-icon"><Newspaper size={19} /></div><div><strong>{news.length}</strong><span>Publicações</span></div></div>
                <div className="stat-card"><div className="stat-icon stat-icon-blue"><Users size={19} /></div><div><strong>{new Set(news.map(item => item.centro)).size}</strong><span>Centros com notícias</span></div></div>
                <div className="stat-card"><div className="stat-icon stat-icon-amber"><Eye size={19} /></div><div><strong>{profileLabel(session.perfil)}</strong><span>Seu perfil</span></div></div>
              </section>

              <section className="news-section">
                <div className="section-heading"><div><h2>Últimas notícias</h2><p>Informações publicadas pela representação acadêmica.</p></div><span className="results-count">{visibleNews.length} {visibleNews.length === 1 ? 'resultado' : 'resultados'}</span></div>
                <div className="filter-bar">
                  <div className="search-field"><Search size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar notícias..." aria-label="Buscar notícias" /></div>
                  <div className="filter-select"><Filter size={17} /><select value={selectedCenter} onChange={e => setSelectedCenter(e.target.value)} aria-label="Filtrar por centro">{CENTROS.map(center => <option key={center}>{center}</option>)}</select><ChevronDown size={15} /></div>
                  <div className="filter-select category-select"><select value={category} onChange={e => setCategory(e.target.value)} aria-label="Filtrar por categoria">{['Todas as categorias', 'Comunicados', 'Conselhos', 'Editais', 'Eventos', 'Informativos', 'Acadêmico'].map(item => <option key={item}>{item}</option>)}</select><ChevronDown size={15} /></div>
                </div>

                {visibleNews.length ? (
                  <div className="news-grid">
                    {visibleNews.map(item => (
                      <NewsCard
                        key={item.id}
                        item={item}
                        onOpen={() => setActiveNews(item)}
                        canManage={session.perfil === 'admin' || (session.perfil === 'conselheiro' && item.autorId === session.id && item.centro === session.centro)}
                        onEdit={() => openEdit(item)}
                        onDelete={() => deleteNews(item)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state"><div className="empty-icon"><FileText size={26} /></div><h3>Nenhuma notícia encontrada</h3><p>Tente mudar o centro, a categoria ou o termo de busca.</p><button className="button button-secondary" onClick={() => { setSelectedCenter('Todos os centros'); setCategory('Todas as categorias'); setSearch('') }}>Limpar filtros</button></div>
                )}
              </section>
            </>
          )}
          <footer className="page-footer"><span>ConectiUDESC</span><span>Projeto acadêmico demonstrativo • Não é um canal oficial da UDESC</span></footer>
        </div>
      </main>
    </div>
  )
}

function UsersManager({ users, centers, currentUser, onAdd, onUpdate, onRemove }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [perfil, setPerfil] = useState('estudante')
  const [centro, setCentro] = useState('CEAD')
  const [formError, setFormError] = useState('')
  const [editing, setEditing] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [term, setTerm] = useState('')

  function submit(event) {
    event.preventDefault()
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      setFormError('Preencha nome, e-mail e senha.')
      return
    }
    if (!email.trim().toLowerCase().endsWith('@udesc.br')) {
      setFormError('Para esta demonstração, use um e-mail terminado em @udesc.br.')
      return
    }
    const ok = onAdd({ nome: nome.trim(), email: email.trim().toLowerCase(), senha, perfil, centro: perfil === 'admin' ? null : centro })
    if (ok) {
      setNome(''); setEmail(''); setSenha(''); setPerfil('estudante'); setCentro('CEAD'); setFormError(''); setShowCreate(false)
    } else setFormError('Confira se o e-mail já está cadastrado.')
  }

  function beginEdit(user) {
    setEditing({ ...user, centro: user.centro || 'CEAD' })
  }

  function saveEdit(event) {
    event.preventDefault()
    if (!editing.nome.trim() || !editing.email.trim()) return
    const ok = onUpdate({ ...editing, nome: editing.nome.trim(), email: editing.email.trim().toLowerCase(), centro: editing.perfil === 'admin' ? null : editing.centro })
    if (ok !== false) setEditing(null)
  }

  const filteredUsers = users.filter(user => `${user.nome} ${user.email} ${user.centro || ''} ${profileLabel(user.perfil)}`.toLocaleLowerCase('pt-BR').includes(term.toLocaleLowerCase('pt-BR')))

  return (
    <section className="users-page">
      <div className="editor-heading"><span className="eyebrow">ÁREA RESTRITA AO ADMINISTRADOR</span><h1>Usuários e permissões</h1><p>Consulte os usuários cadastrados e gerencie suas permissões.</p></div>
      <div className="users-toolbar">
        <div className="users-summary"><div className="stat-icon"><Users size={19} /></div><div><strong>{users.length} usuários cadastrados</strong><span>Contas de demonstração guardadas neste navegador.</span></div></div>
        <button className="button button-primary" type="button" onClick={() => { setShowCreate(value => !value); setFormError('') }}><UserPlus size={16} /> {showCreate ? 'Cancelar cadastro' : 'Cadastrar usuário'}</button>
      </div>
      {showCreate && <form className="editor-card user-create-card" onSubmit={submit}>
        <div className="form-section-title"><span className="form-step"><UserPlus size={15} /></span><div><strong>Novo usuário</strong><p>Informe os dados e defina a permissão de acesso.</p></div></div>
        <div className="user-create-grid">
          <div><label htmlFor="new-user-name">Nome completo *</label><input id="new-user-name" value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do usuário" required /></div>
          <div><label htmlFor="new-user-email">E-mail UDESC *</label><input id="new-user-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nome@udesc.br" required /></div>
          <div><label htmlFor="new-user-password">Senha demonstrativa *</label><input id="new-user-password" type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Crie uma senha" required /></div>
          <div><label htmlFor="new-user-role">Permissão</label><select id="new-user-role" value={perfil} onChange={e => setPerfil(e.target.value)}><option value="estudante">Aluno — somente leitura</option><option value="conselheiro">Conselheiro — publica no centro</option><option value="admin">Administrador — publica para toda a UDESC</option></select></div>
          {perfil !== 'admin' && <div><label htmlFor="new-user-center">Centro universitário</label><select id="new-user-center" value={centro} onChange={e => setCentro(e.target.value)}>{centers.filter(item => item !== 'Geral / UDESC').map(item => <option key={item}>{item}</option>)}</select></div>}
        </div>
        {formError && <div className="error-message">{formError}</div>}
        <div className="form-actions"><button className="button button-primary" type="submit"><UserPlus size={16} /> Cadastrar usuário</button></div>
      </form>}
      <div className="users-list-heading"><div><h2>Usuários cadastrados</h2><p>Use Editar para alterar os dados e as permissões.</p></div><div className="users-search"><Search size={16} /><input value={term} onChange={e => setTerm(e.target.value)} placeholder="Buscar nome, e-mail ou centro" /></div></div>
      <div className="users-table-wrap"><table className="users-table"><thead><tr><th>Nome</th><th>E-mail</th><th>Centro</th><th>Permissão</th><th>Ações</th></tr></thead><tbody>
        {filteredUsers.map(user => <tr key={user.id}>
          <td className="table-user-name">{user.nome}{user.id === currentUser.id ? ' (você)' : ''}</td>
          <td>{user.email}</td><td>{user.perfil === 'admin' ? 'Toda a UDESC' : user.centro}</td>
          <td><span className={`role-pill role-${user.perfil}`}>{profileLabel(user.perfil)}</span></td>
          <td><div className="table-actions"><button className="button button-secondary table-action" type="button" onClick={() => beginEdit(user)}><Pencil size={14} /> Editar</button><button className="button button-danger table-action" type="button" disabled={user.id === currentUser.id} onClick={() => onRemove(user)} aria-label={`Excluir ${user.nome}`}><Trash2 size={14} /> Excluir</button></div></td>
        </tr>)}
        {!filteredUsers.length && <tr><td colSpan="5" className="table-empty">Nenhum usuário encontrado.</td></tr>}
      </tbody></table></div>
      {editing && <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setEditing(null) }}><form className="editor-card user-edit-modal" onSubmit={saveEdit}>
        <div className="form-section-title"><span className="form-step"><Pencil size={15} /></span><div><strong>Editar usuário</strong><p>Atualize os dados de {editing.nome}.</p></div><button className="icon-button modal-close" type="button" onClick={() => setEditing(null)} aria-label="Fechar"><X size={18} /></button></div>
        <label htmlFor="edit-user-name">Nome completo</label><input id="edit-user-name" value={editing.nome} onChange={e => setEditing(current => ({ ...current, nome: e.target.value }))} required />
        <label htmlFor="edit-user-email">E-mail</label><input id="edit-user-email" type="email" value={editing.email} onChange={e => setEditing(current => ({ ...current, email: e.target.value }))} required />
        <label htmlFor="edit-user-role">Permissão</label><select id="edit-user-role" value={editing.perfil} disabled={editing.id === currentUser.id} onChange={e => setEditing(current => ({ ...current, perfil: e.target.value, centro: e.target.value === 'admin' ? null : (current.centro || 'CEAD') }))}><option value="estudante">Aluno</option><option value="conselheiro">Conselheiro</option><option value="admin">Administrador</option></select>
        {editing.perfil !== 'admin' && <><label htmlFor="edit-user-center">Centro universitário</label><select id="edit-user-center" value={editing.centro || 'CEAD'} onChange={e => setEditing(current => ({ ...current, centro: e.target.value }))}>{centers.filter(item => item !== 'Geral / UDESC').map(item => <option key={item}>{item}</option>)}</select></>}
        {editing.id === currentUser.id && <p className="self-admin-note">Sua permissão de administrador não pode ser alterada nesta tela.</p>}
        <div className="form-actions"><button type="button" className="button button-secondary" onClick={() => setEditing(null)}>Cancelar</button><button className="button button-primary" type="submit"><Save size={15} /> Salvar alterações</button></div>
      </form></div>}
      <div className="permission-note"><ShieldCheck size={17} /><p><strong>Como funciona:</strong> Alunos só leem notícias; conselheiros publicam exclusivamente no centro vinculado ao cadastro; o administrador publica comunicados gerais para toda a UDESC e gerencia usuários e notícias.</p></div>
    </section>
  )
}

function NewsCard({ item, onOpen, canManage, onEdit, onDelete }) {
  return (
    <article className="news-card">
      <div className={`news-card-art art-${item.centro.toLowerCase()}`}>
        <div className="news-card-art-top"><span>{item.centro}</span>{item.fixada && <span className="pinned">Fixada</span>}</div>
        <div className="news-card-art-icon"><Newspaper size={34} strokeWidth={1.5} /></div>
        <span className="art-word">{item.centro}</span>
      </div>
      <div className="news-card-content">
        <div className="news-card-tags"><span className="tag">{item.categoria}</span><span className="date-text">{formatDate(item.data)}</span></div>
        <button className="news-title-button" onClick={onOpen}><h3>{item.titulo}</h3></button>
        <p className="news-summary">{item.resumo}</p>
        <div className="news-card-footer"><span className="author"><CircleUserRound size={15} /> {item.autorNome}</span><button className="read-more" onClick={onOpen}>Ler notícia <ArrowLeft size={15} /></button></div>
        {canManage && <div className="card-management"><button onClick={onEdit}><Pencil size={14} /> Editar</button><button onClick={onDelete}><Trash2 size={14} /> Excluir</button></div>}
      </div>
    </article>
  )
}

function NewsEditor({ initial, session, onSave, onCancel }) {
  const [titulo, setTitulo] = useState(initial?.titulo || '')
  const [resumo, setResumo] = useState(initial?.resumo || '')
  const [conteudo, setConteudo] = useState(initial?.conteudo || '')
  const [categoria, setCategoria] = useState(initial?.categoria || 'Comunicados')
  const [centro, setCentro] = useState(initial?.centro || (session.perfil === 'admin' ? 'Geral / UDESC' : session.centro))
  const [fixada, setFixada] = useState(Boolean(initial?.fixada))
  const [error, setError] = useState('')

  function submit(event) {
    event.preventDefault()
    if (!titulo.trim() || !resumo.trim() || !conteudo.trim()) {
      setError('Preencha o título, o resumo e o conteúdo.')
      return
    }
    if (session.perfil === 'conselheiro' && !session.centro) {
      setError('Este usuário não tem um centro vinculado. Peça ao administrador para revisar o cadastro.')
      return
    }
    onSave({ titulo, resumo, conteudo, categoria, centro, fixada })
  }

  return (
    <section className="editor-page">
      <button className="back-link" onClick={onCancel}><ArrowLeft size={17} /> Voltar ao fórum</button>
      <div className="editor-heading"><span className="eyebrow">{initial ? 'GERENCIAR PUBLICAÇÃO' : 'CONTRIBUIR COM O FÓRUM'}</span><h1>{initial ? 'Editar notícia' : 'Nova publicação'}</h1><p>Compartilhe informações claras e relevantes com a comunidade acadêmica.</p></div>
      <form className="editor-card" onSubmit={submit}>
        <div className="form-section-title"><span className="form-step">1</span><div><strong>Conteúdo da notícia</strong><p>Informe os dados que serão exibidos no fórum.</p></div></div>
        <label htmlFor="titulo">Título da notícia *</label>
        <input id="titulo" value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={120} placeholder="Ex.: Reunião do conselho/geral" required />
        <label htmlFor="resumo">Resumo *</label>
        <textarea id="resumo" value={resumo} onChange={e => setResumo(e.target.value)} rows={2} maxLength={220} placeholder="Escreva uma breve descrição da notícia." required />
        <label htmlFor="conteudo">Conteúdo completo *</label>
        <textarea id="conteudo" value={conteudo} onChange={e => setConteudo(e.target.value)} rows={7} placeholder="Escreva aqui os detalhes, datas e informações importantes." required />
        <div className="form-grid">
          <div><label htmlFor="categoria">Categoria</label><select id="categoria" value={categoria} onChange={e => setCategoria(e.target.value)}>{['Comunicados', 'Conselhos', 'Editais', 'Eventos', 'Informativos', 'Acadêmico'].map(item => <option key={item}>{item}</option>)}</select></div>
          <div><label>{session.perfil === 'admin' ? 'Abrangência da publicação' : 'Centro universitário'}</label>
            {session.perfil === 'admin'
              ? <div className="locked-center"><ShieldCheck size={17} /><strong>Toda a UDESC</strong><span>Comunicado geral</span></div>
              : <div className="locked-center"><ShieldCheck size={17} /><strong>{session.centro || 'Centro não cadastrado'}</strong><span>Vinculado ao seu perfil</span></div>
            }
          </div>
        </div>
        <label className="checkbox-line"><input type="checkbox" checked={fixada} onChange={e => setFixada(e.target.checked)} /><span><strong>Fixar notícia no início do feed</strong><small>Use somente para comunicados importantes.</small></span></label>
        {error && <div className="error-message">{error}</div>}
        <div className="form-actions"><button type="button" className="button button-secondary" onClick={onCancel}>Cancelar</button><button type="submit" className="button button-primary"><CheckCircle2 size={17} /> {initial ? 'Salvar alterações' : 'Publicar notícia'}</button></div>
        <div className="permission-note"><ShieldCheck size={17} /><p>{session.perfil === 'admin' ? 'Sua publicação será geral e aparecerá para toda a comunidade da UDESC.' : `Seu cadastro está vinculado ao ${session.centro}. A notícia será publicada somente nesse centro.`}</p></div>
      </form>
    </section>
  )
}

export default App
