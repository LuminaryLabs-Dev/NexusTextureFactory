        const NavBar = ({ uiVM }) => (
            <div className="h-12 bg-[#1a1a1a] flex items-center justify-center gap-8 border-b border-gray-800 shrink-0">
                <button onClick={() => uiVM.setActiveTab('generator')} className={`tab-btn text-xs font-bold tracking-widest ${uiVM.activeTab === 'generator' ? 'text-white active' : 'text-gray-500 hover:text-gray-300'}`}>FACTORY</button>
                <button onClick={() => uiVM.setActiveTab('builder')} className={`tab-btn text-xs font-bold tracking-widest ${uiVM.activeTab === 'builder' ? 'text-white active' : 'text-gray-500 hover:text-gray-300'}`}>WORKBENCH</button>
                <button onClick={() => uiVM.setActiveTab('sets')} className={`tab-btn text-xs font-bold tracking-widest ${uiVM.activeTab === 'sets' ? 'text-white active' : 'text-gray-500 hover:text-gray-300'}`}>SETS</button>
                <button onClick={() => uiVM.setActiveTab('flipbook')} className={`tab-btn text-xs font-bold tracking-widest ${uiVM.activeTab === 'flipbook' ? 'text-white active' : 'text-gray-500 hover:text-gray-300'}`}>FLIPBOOK</button>
                <button onClick={() => uiVM.setActiveTab('filters')} className={`tab-btn text-xs font-bold tracking-widest ${uiVM.activeTab === 'filters' ? 'text-white active' : 'text-gray-500 hover:text-gray-300'}`}>FILTERS</button>
                <button onClick={() => uiVM.setActiveTab('operations')} className={`tab-btn text-xs font-bold tracking-widest ${uiVM.activeTab === 'operations' ? 'text-white active' : 'text-gray-500 hover:text-gray-300'}`}>OPERATIONS</button>
                <button onClick={() => uiVM.setActiveTab('editor')} className={`tab-btn text-xs font-bold tracking-widest ${uiVM.activeTab === 'editor' ? 'text-white active' : 'text-gray-500 hover:text-gray-300'}`}>EDITOR</button>
                <button onClick={() => uiVM.setActiveTab('settings')} className={`tab-btn text-xs font-bold tracking-widest ${uiVM.activeTab === 'settings' ? 'text-white active' : 'text-gray-500 hover:text-gray-300'}`}>SETTINGS</button>
            </div>
        );

        function App() {
            const vm = useAppViewModel();
            return (
                <div className="flex flex-col h-screen bg-[#111] text-gray-200 font-sans">
                    <NavBar uiVM={vm.ui} />
                    <div className="h-8 px-4 border-b border-gray-800 bg-[#121212] flex items-center justify-between text-[11px] text-gray-400 font-mono">
                        <span>LOCAL CACHE</span>
                        <span>{formatBytes(vm.storage.usedBytes)}{vm.storage.quotaBytes ? ` / ${formatBytes(vm.storage.quotaBytes)}` : ''}</span>
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                        {vm.ui.activeTab === 'builder' && <BuilderTab bVM={vm.builder} uiVM={vm.ui} customOpsVM={vm.customOps} />}
                        {vm.ui.activeTab === 'generator' && <GeneratorTab dVM={vm.dream} libVM={vm.library} previewEngine={vm.engines.preview} uiVM={vm.ui} flipbookVM={vm.flipbook} />}
                        {vm.ui.activeTab === 'sets' && <SetsTab libVM={vm.library} previewEngine={vm.engines.preview} uiVM={vm.ui} flipbookVM={vm.flipbook} />}
                        {vm.ui.activeTab === 'flipbook' && <FlipbookTab flipbookVM={vm.flipbook} />}
                        {vm.ui.activeTab === 'filters' && <FiltersTab filtersVM={vm.filters} />}
                        {vm.ui.activeTab === 'operations' && <OperationsTab customOpsVM={vm.customOps} />}
                        {vm.ui.activeTab === 'editor' && <EditorTab customOpsVM={vm.customOps} />}
                        {vm.ui.activeTab === 'settings' && <SettingsTab uiVM={vm.ui} dVM={vm.dream} />}
                    </div>
                </div>
            );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
