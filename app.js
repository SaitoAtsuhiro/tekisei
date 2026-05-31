// Initial Sample Data
const initialData = [
    {
        id: 1,
        companyName: '株式会社サンプル',
        testType: 'SPI',
        testDate: '2025-03',
        details: 'テストセンターでの受験でした。非言語が難しめだったので、推論と確率の対策をしっかりやっておくことをおすすめします。',
        createdAt: '2024-05-20T10:00:00Z'
    },
    {
        id: 2,
        companyName: 'テスト・テクノロジー株式会社',
        testType: 'コーディングテスト',
        testDate: '2025-04',
        details: 'Trackというプラットフォームを使ったコーディングテスト。アルゴリズム問題が2問（制限時間90分）。動的計画法の基礎が出ました。',
        createdAt: '2024-05-19T14:30:00Z'
    },
    {
        id: 3,
        companyName: 'グローバル商事',
        testType: '玉手箱',
        testDate: '2025-02',
        details: 'Web自宅受験。計数理解と英語がありました。英語の長文読解は時間がタイトなので、スピードを意識して解く必要があります。',
        createdAt: '2024-05-18T09:15:00Z'
    }
];

// State
let testData = [];

// DOM Elements
const cardsContainer = document.getElementById('cards-container');
const resultsCount = document.getElementById('results-count');
const noResults = document.getElementById('no-results');
const searchInput = document.getElementById('search-input');
const filterSelect = document.getElementById('filter-select');

// Modal Elements
const modal = document.getElementById('register-modal');
const openModalBtn = document.getElementById('open-register-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelBtn = document.getElementById('cancel-btn');
const registerForm = document.getElementById('register-form');
const toast = document.getElementById('toast');

// Initialize
function init() {
    // Load data from LocalStorage
    const storedData = localStorage.getItem('testShareData');
    if (storedData) {
        testData = JSON.parse(storedData);
    } else {
        testData = [...initialData];
        saveData();
    }
    
    renderCards(testData);
    setupEventListeners();
}

// Save Data
function saveData() {
    localStorage.setItem('testShareData', JSON.stringify(testData));
}

// Get appropriate class for test tag
function getTagClass(testType) {
    switch(testType) {
        case 'SPI': return 'tag-spi';
        case '玉手箱': return 'tag-tamatebako';
        case 'TG-WEB': return 'tag-tgweb';
        case 'コーディングテスト': return 'tag-coding';
        default: return '';
    }
}

// Format Date string
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
}

// Render Cards
function renderCards(data) {
    cardsContainer.innerHTML = '';
    
    if (data.length === 0) {
        cardsContainer.classList.add('hidden');
        noResults.classList.remove('hidden');
        resultsCount.textContent = '0 件';
        return;
    }
    
    cardsContainer.classList.remove('hidden');
    noResults.classList.add('hidden');
    resultsCount.textContent = `${data.length} 件`;
    
    // Sort by newest
    const sortedData = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    sortedData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card glass-panel';
        
        const testDateHtml = item.testDate ? `<span class="card-date"><i class="ph ph-calendar"></i> 受験時期: ${item.testDate}</span>` : '';
        
        card.innerHTML = `
            <div class="card-header">
                <div>
                    <h4 class="card-title">${escapeHTML(item.companyName)}</h4>
                    ${testDateHtml}
                </div>
                <span class="test-tag ${getTagClass(item.testType)}">${escapeHTML(item.testType)}</span>
            </div>
            <div class="card-body">
                <p class="card-details">${escapeHTML(item.details || '詳細はありません。')}</p>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); text-align: right; margin-top: 8px;">
                登録日: ${formatDate(item.createdAt)}
            </div>
        `;
        
        cardsContainer.appendChild(card);
    });
}

// Basic HTML Sanitizer to prevent XSS
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Filter Logic
function handleFilter() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filterType = filterSelect.value;
    
    const filteredData = testData.filter(item => {
        const matchSearch = item.companyName.toLowerCase().includes(searchTerm) || 
                            (item.details && item.details.toLowerCase().includes(searchTerm));
        const matchType = filterType === 'all' || item.testType === filterType;
        
        return matchSearch && matchType;
    });
    
    renderCards(filteredData);
}

// Modal Logic
function openModal() {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    registerForm.reset();
}

function showToast() {
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Setup Event Listeners
function setupEventListeners() {
    // Search and Filter
    searchInput.addEventListener('input', handleFilter);
    filterSelect.addEventListener('change', handleFilter);
    
    // Modal
    openModalBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Form Submit
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const companyName = document.getElementById('company-name').value;
        const testType = document.getElementById('test-type').value;
        const testDate = document.getElementById('test-date').value;
        const details = document.getElementById('details').value;
        
        const newItem = {
            id: Date.now(),
            companyName,
            testType,
            testDate,
            details,
            createdAt: new Date().toISOString()
        };
        
        testData.push(newItem);
        saveData();
        
        // Refresh view with current filters
        handleFilter();
        
        closeModal();
        showToast();
    });
}

// Run init when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
