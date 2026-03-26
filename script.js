// Backend API URL (Automatically switches between Local code and Live Cloud URL)
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000/api/teams' 
    : 'https://ebl-backend-app.onrender.com/api/teams'; // You will replace this with your actual Render URL later

// State & Core Data
let teams = [];
let currentLang = localStorage.getItem('ebl_lang') || 'en';

// DOM Elements
const standingsContainer = document.getElementById('standingsContainer');
const addTeamBtn = document.getElementById('addTeamBtn');
const teamModal = document.getElementById('teamModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const teamForm = document.getElementById('teamForm');
const imagePreview = document.getElementById('imagePreview');
const teamLogoInput = document.getElementById('teamLogo');
const modalTitle = document.getElementById('modalTitle');

let currentLogoDataUrl = null;

// i18n Translations
const translations = {
    en: {
        league_title: "Ethiopian Premier League",
        league_subtitle: "Basketball Standings",
        header_standings: "Current Standings",
        col_pos: "POS",
        col_team: "TEAM",
        col_p: "P",
        col_w: "W",
        col_l: "L",
        col_gf: "GF",
        col_ga: "GA",
        col_diff: "+/-",
        col_pts: "PTS",
        modal_add: "Add New Team",
        modal_edit: "Edit Team",
        label_logo: "Team Logo",
        label_team_name: "Team Name",
        label_wins: "Wins (W)",
        label_losses: "Losses (L)",
        label_pf: "Goals For (GF)",
        label_pa: "Goals Against (GA)",
        btn_save: "Save Team"
    },
    am: {
        league_title: "የኢትዮጵያ ፕሪሚየር ሊግ",
        league_subtitle: "የቅርጫት ኳስ ደረጃ",
        header_standings: "ወቅታዊ ደረጃዎች",
        col_pos: "ደረጃ",
        col_team: "ቡድን",
        col_p: "ጨ",
        col_w: "ድ",
        col_l: "ሽ",
        col_gf: "ያገባው",
        col_ga: "የገባበት",
        col_diff: "+/-",
        col_pts: "ነጥብ",
        modal_add: "አዲስ ቡድን ጨምር",
        modal_edit: "ቡድንን አስተካክል",
        label_logo: "የቡድን ዓርማ",
        label_team_name: "የቡድን ስም",
        label_wins: "ድል (ድ)",
        label_losses: "ሽንፈት (ሽ)",
        label_pf: "ያገባው ጎል (GF)",
        label_pa: "የገባበት ጎል (GA)",
        btn_save: "አስቀምጥ"
    }
};

// Initialize app
function init() {
    setupEventListeners();
    setLanguage(currentLang);
    fetchTeams();
}

// Backend DB API Calls
async function fetchTeams() {
    standingsContainer.innerHTML = '<div style="text-align:center; padding: 2rem; color: var(--text-muted)">Loading from Cloud Database...</div>';
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch teams');
        
        teams = await response.json(); // The backend natively sorts the response for us!
        renderStandings();
    } catch (error) {
        console.error('Error fetching teams from database:', error);
        standingsContainer.innerHTML = `<div style="text-align:center; padding: 2rem; color: #ef4444">Backend connection failed. Is the server running?</div>`;
    }
}

function setupEventListeners() {
    // Modal controls
    addTeamBtn.addEventListener('click', openAddModal);
    closeModalBtn.addEventListener('click', closeModal);
    teamForm.addEventListener('submit', handleFormSubmit);
    
    // Image upload trigger
    imagePreview.addEventListener('click', () => teamLogoInput.click());
    teamLogoInput.addEventListener('change', handleImageUpload);
    
    // Language toggles
    document.getElementById('btn-en').addEventListener('click', () => setLanguage('en'));
    document.getElementById('btn-am').addEventListener('click', () => setLanguage('am'));
}

// Rendering Logic
function renderStandings() {
    standingsContainer.innerHTML = '';
    
    if (teams.length === 0) {
        standingsContainer.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-muted)">No teams in database. Click '+' to begin.</div>`;
        return;
    }
    
    // The backend provides calculated fields: played, diff, points out of the box.
    teams.forEach((team, index) => {
        const pos = index + 1;
        const totalTeams = teams.length;
        
        // Relegation Logic: Highlight bottom 2 teams only if there are enough teams to justify relegation
        const isRelegated = totalTeams >= 4 && pos > totalTeams - 2;
        
        const card = document.createElement('div');
        card.className = `team-card pos-${pos} ${isRelegated ? 'relegation' : ''}`;
        
        const logoBg = team.logo ? `url(${team.logo})` : 'linear-gradient(135deg, var(--primary-light), var(--primary))';
        const pdStr = team.diff > 0 ? `+${team.diff}` : team.diff; // The backend names this field `diff`
        
        // Mongo IDs are stored inside _id
        const teamId = team._id ? `'${team._id}'` : `'${team.id}'`;
        
        card.innerHTML = `
            <div class="card-left">
                <span class="pos-number">${pos}</span>
                <div class="team-logo-placeholder" style="background: ${logoBg}; background-size: cover; background-position: center;"></div>
                <span class="team-name" title="${team.name}">${team.name}</span>
            </div>
            <div class="card-right">
                <span class="stat">${team.played || 0}</span>
                <span class="stat">${team.wins || 0}</span>
                <span class="stat">${team.losses || 0}</span>
                <span class="stat">${team.scored || 0}</span>
                <span class="stat">${team.conceded || 0}</span>
                <span class="stat">${pdStr || 0}</span>
                <span class="stat stat-pts">${team.points || 0}</span>
                <div class="team-actions col-actions">
                    <button type="button" class="action-btn edit" onclick="editTeam(${teamId})" title="Edit"><i class="fa-solid fa-pen"></i></button>
                    <button type="button" class="action-btn delete" onclick="deleteTeam(${teamId})" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
        standingsContainer.appendChild(card);
    });
}

// Form logic handling Backend requests
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving to Database...';
    submitBtn.disabled = true;

    const idField = document.getElementById('editTeamId').value;
    
    const teamData = {
        name: document.getElementById('teamName').value,
        wins: parseInt(document.getElementById('teamWins').value),
        losses: parseInt(document.getElementById('teamLosses').value),
        pf: parseInt(document.getElementById('teamPF').value),
        pa: parseInt(document.getElementById('teamPA').value)
    };
    
    // We only attach Logo if it was newly uploaded or keep it blank if untouched to prevent overhead.
    if (currentLogoDataUrl) {
        teamData.logo = currentLogoDataUrl;
    } else if (idField) {
        // Find existing to preserve logo safely
        const existingTeam = teams.find(t => t._id === idField);
        if (existingTeam && existingTeam.logo) {
            teamData.logo = existingTeam.logo;
        }
    }

    try {
        let response;
        if (idField) {
            // Update mode
            response = await fetch(`${API_URL}/${idField}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(teamData)
            });
        } else {
            // Create mode
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(teamData)
            });
        }
        
        if (!response.ok) throw new Error('Failed to save to database');
        
        // Refresh directly from Database to ensure perfect sync
        await fetchTeams();
        closeModal();
    } catch (error) {
        console.error('Error saving team:', error);
        alert('Could not save team to the server. Check your connection.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            currentLogoDataUrl = event.target.result;
            imagePreview.style.backgroundImage = `url(${currentLogoDataUrl})`;
            imagePreview.innerHTML = '';
        };
        reader.readAsDataURL(file);
    }
}

// CRUD Operations
function editTeam(id) {
    // Both 'id' argument and '_id' variable mapped logic for MongoDB compatibility
    const team = teams.find(t => t._id === id || t.id === id);
    if (!team) return;
    
    document.getElementById('editTeamId').value = team._id || team.id;
    document.getElementById('teamName').value = team.name;
    document.getElementById('teamWins').value = team.wins;
    document.getElementById('teamLosses').value = team.losses;
    
    // The backend uses scored and conceded, but front uses PF and PA logic
    document.getElementById('teamPF').value = team.scored || 0;
    document.getElementById('teamPA').value = team.conceded || 0;
    
    if (team.logo) {
        currentLogoDataUrl = team.logo; // This avoids losing standard references
        imagePreview.style.backgroundImage = `url(${team.logo})`;
        imagePreview.innerHTML = '';
    } else {
        currentLogoDataUrl = null;
        imagePreview.style.backgroundImage = '';
        imagePreview.innerHTML = '<i class="fa-solid fa-image"></i>';
    }
    
    document.getElementById('modalTitle').textContent = translations[currentLang].modal_edit;
    teamModal.classList.add('active');
}

async function deleteTeam(id) {
    if (confirm("Are you sure you want to delete this team permanently from the database?")) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete team');
            
            // Re-fetch clean list after deleting
            await fetchTeams();
        } catch (error) {
            console.error('Error deleting team:', error);
            alert("Delete failed due to server error.");
        }
    }
}

// Modal handling
function openAddModal() {
    teamForm.reset();
    document.getElementById('editTeamId').value = '';
    currentLogoDataUrl = null;
    imagePreview.style.backgroundImage = '';
    imagePreview.innerHTML = '<i class="fa-solid fa-image"></i>';
    document.getElementById('modalTitle').textContent = translations[currentLang].modal_add;
    teamModal.classList.add('active');
}

function closeModal() {
    teamModal.classList.remove('active');
}

// Language logic (Keep preferences cached locally, not in cloud)
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('ebl_lang', lang);
    
    // Toggle active classes
    document.getElementById('btn-en').classList.toggle('lang-active', lang === 'en');
    document.getElementById('btn-am').classList.toggle('lang-active', lang === 'am');
    
    // Update texts across DOM via data-i18n
    const t = translations[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });

    // Handle dynamic modal title
    const editId = document.getElementById('editTeamId').value;
    if (teamModal.classList.contains('active')) {
        document.getElementById('modalTitle').textContent = editId ? t.modal_edit : t.modal_add;
    }
}

// Start application
init();
