function AppHeader({
  healthStatus,
  healthCheckedAgo,
  isCheckingHealth,
  onCheckHealth,
}) {
  return (
    <header className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">SmartHub</h1>
          <p className="text-sm text-gray-600">Hub inteligente de recursos educacionais</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-start gap-0.5">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
              API: <strong>{healthStatus}</strong>
            </span>
            <span className="text-xs text-gray-500">
              {healthCheckedAgo === 'Não verificado'
                ? healthCheckedAgo
                : healthCheckedAgo === 'agora'
                  ? 'Verificado agora'
                  : `Verificado ${healthCheckedAgo}`}
            </span>
          </div>
          <button
            type="button"
            onClick={onCheckHealth}
            disabled={isCheckingHealth}
            className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            {isCheckingHealth ? 'Verificando...' : 'Verificar status'}
          </button>
        </div>
      </div>
    </header>
  )
}

export default AppHeader
