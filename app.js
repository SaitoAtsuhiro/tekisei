// Supabase Configuration
const SUPABASE_URL = 'https://lzoknthucbqqqtpsuitj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6b2tudGh1Y2JxcXF0cHN1aXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMDY0NjUsImV4cCI6MjA5NTY4MjQ2NX0.RVWfzTfI9UrY0FQ16WlDxS_KEUB0oLQXseRfoYDuJSI';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
async function init() {
    await loadData();
    renderCards(testData);
    setupEventListeners();
}

// Load Data from Supabase
async function loadData() {
    const { data, error } = await db
        .from('test_entries')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('データの読み込みに失敗しました:', error);
        return;
    }

    testData = data.map(item => ({
        id: item.id,
        companyName: item.company_name,
        testType: item.test_type,
        testDate: item.test_date,
        details: item.details,
        createdAt: item.created_at
    }));
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

    const sortedData = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    sortedData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card glass-panel';

        const testDateHtml = item.testDate
            ? `<span class="card-date"><i class="ph ph-calendar"></i> 受験時期: ${item.testDate}</span>`
            : '';

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
    document.body.style.overflow = 'hidden';
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
    searchInput.addEventListener('input', handleFilter);
    filterSelect.addEventListener('change', handleFilter);

    openModalBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = registerForm.querySelector('[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = '登録中...';

        const companyName = document.getElementById('company-name').value;
        const testType = document.getElementById('test-type').value;
        const testDate = document.getElementById('test-date').value;
        const details = document.getElementById('details').value;

        const { data, error } = await db
            .from('test_entries')
            .insert([{
                company_name: companyName,
                test_type: testType,
                test_date: testDate || null,
                details: details || null
            }])
            .select()
            .single();

        submitBtn.disabled = false;
        submitBtn.textContent = '登録する';

        if (error) {
            console.error('登録に失敗しました:', error);
            alert('登録に失敗しました。もう一度お試しください。');
            return;
        }

        testData.unshift({
            id: data.id,
            companyName: data.company_name,
            testType: data.test_type,
            testDate: data.test_date,
            details: data.details,
            createdAt: data.created_at
        });

        handleFilter();
        closeModal();
        showToast();
    });
}

document.addEventListener('DOMContentLoaded', init);
