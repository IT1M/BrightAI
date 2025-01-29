// بيانات نموذجية للمستندات
const documents = [
    {
        title: "التحول الرقمي باستخدام الذكاء الاصطناعي",
        category: "استشارات الذكاء الاصطناعي",
        date: "20 يناير 2025",
        description: "دليل شامل حول كيفية استخدام تقنيات الذكاء الاصطناعي لتحقيق التحول الرقمي، مع أمثلة عملية من السوق السعودي.",
        file: "ai-transformation.pdf"
    },
    {
        title: "أتمتة العمليات التشغيلية",
        category: "أتمتة العمليات",
        date: "15 يناير 2025",
        description: "دليل تفصيلي لأتمتة المهام المتكررة وتحسين الكفاءة التشغيلية باستخدام حلول الذكاء الاصطناعي.",
        file: "process-automation.pdf"
    }
];

// تهيئة واجهة المستخدم
document.addEventListener('DOMContentLoaded', () => {
    renderDocuments(documents);
    setupEventListeners();
});

function renderDocuments(docs) {
    const grid = document.getElementById('documentsGrid');
    grid.innerHTML = '';
    
    docs.forEach(doc => {
        const card = document.createElement('div');
        card.className = 'document-card';
        card.innerHTML = `
            <h3>${doc.title}</h3>
            <div class="doc-meta">
                <span>${doc.category}</span>
                <span>${doc.date}</span>
            </div>
            <p>${doc.description}</p>
            <button class="view-btn" data-file="${doc.file}">عرض المستند</button>
        `;
        card.addEventListener('click', () => showDocumentPreview(doc));
        grid.appendChild(card);
    });
}

function setupEventListeners() {
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.querySelectorAll('.categories li').forEach(li => {
        li.addEventListener('click', () => filterByCategory(li.textContent));
    });
}

function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = documents.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm) ||
        doc.description.toLowerCase().includes(searchTerm)
    );
    renderDocuments(filtered);
}

function filterByCategory(category) {
    const filtered = documents.filter(doc => doc.category === category);
    renderDocuments(filtered);
}

function showDocumentPreview(doc) {
    const preview = document.getElementById('docPreview');
    preview.style.display = 'block';
    document.getElementById('docTitle').textContent = doc.title;
    document.getElementById('docCategory').textContent = doc.category;
    document.getElementById('docDate').textContent = doc.date;
    document.getElementById('docDescription').textContent = doc.description;
    
    // Update download button
    const downloadBtn = document.querySelector('.download-btn');
    downloadBtn.onclick = () => window.open(doc.file, '_blank');
    
    showRecommendedDocuments(doc.category);
}

function showRecommendedDocuments(currentCategory) {
    const recommended = documents.filter(doc => 
        doc.category === currentCategory && doc.title !== document.getElementById('docTitle').textContent
    );
    const recGrid = document.getElementById('recGrid');
    recGrid.innerHTML = '';
    
    recommended.forEach(doc => {
        const recCard = document.createElement('div');
        recCard.className = 'document-card';
        recCard.innerHTML = `
            <h4>${doc.title}</h4>
            <p class="doc-meta">${doc.category} - ${doc.date}</p>
        `;
        recCard.addEventListener('click', () => showDocumentPreview(doc));
        recGrid.appendChild(recCard);
    });
