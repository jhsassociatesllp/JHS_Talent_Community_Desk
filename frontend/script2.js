document.addEventListener('DOMContentLoaded', () => {
    feather.replace();

    const API_BASE_URL = 'http://localhost:8000';

    // Authentication Check
    const token = localStorage.getItem('access_token');
    if (!token) {
        console.error('No auth token found');
        window.location.href = 'login.html';
        return;
    }

    // === USER NAME ===
    const userNameSpan = document.getElementById('userName');
    const storedName = localStorage.getItem('userName');
    if (storedName) userNameSpan.textContent = storedName;

    // === SIDEBAR TOGGLE ===
    const sidebar = document.getElementById('sidebar');
    const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');

    toggleSidebarBtn.addEventListener('click', () => sidebar.classList.remove('sidebar-hidden'));
    closeSidebarBtn.addEventListener('click', () => sidebar.classList.add('sidebar-hidden'));

    // === PAGE SWITCHING ===
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');

    function showPage(pageId) {
        if (pageId === 'logout') {
            Swal.fire({
                title: 'Logout',
                text: 'Do you want to logout?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: 'var(--primary)',
                cancelButtonColor: 'var(--danger)',
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.clear();
                    window.location.href = 'login.html';
                }
            });
            return;
        }

        pages.forEach(page => page.classList.add('hidden'));
        document.getElementById(`${pageId}-page`).classList.remove('hidden');

        navItems.forEach(item => item.classList.remove('active'));
        const activeNavItem = document.querySelector(`[data-page="${pageId}"]`);
        if (activeNavItem) activeNavItem.classList.add('active');

        if (window.innerWidth < 768) sidebar.classList.add('sidebar-hidden');

        if (pageId === 'messaged') fetchMessaged();
        if (pageId === 'interviews') fetchScheduled();
        if (pageId === 'candidates') {
            fetchLocations();
            fetchCandidates();
        }
        if (pageId === 'slots') initSlotsPage();
    }

    navItems.forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            showPage(item.getAttribute('data-page'));
        });
    });

    showPage('slots');

    // === SLOTS PAGE ===
    // function initSlotsPage() {
    //     const addDateBtn = document.getElementById('addDateBtn');
    //     const dateContainer = document.getElementById('dateContainer');
    //     const saveSlotsBtn = document.getElementById('saveSlotsBtn');

    //     addDateBtn.addEventListener('click', () => {
    //         if (dateContainer.children.length >= 5) {
    //             Swal.fire({ icon: 'warning', title: 'Limit Reached', text: 'Maximum 5 dates allowed.' });
    //             return;
    //         }

    //         const div = document.createElement('div');
    //         div.className = 'border rounded-lg p-4 bg-white';
    //         div.innerHTML = `
    //         <div class="flex justify-between items-center mb-3">
    //             <input type="date" min="${getTomorrow()}" class="border p-2 rounded w-1/2">
    //             <button type="button" class="text-red-500 hover:text-red-700 removeDateBtn">Remove</button>
    //         </div>
    //         <div class="ml-4 space-y-2">
    //             <label class="font-medium">Shifts:</label>
    //             <div class="space-y-4">
    //                 ${['morning', 'afternoon'].map(shift => `
    //                     <div class="shift-block border rounded p-3 bg-gray-50">
    //                         <label class="flex items-center space-x-2 font-medium mb-2">
    //                             <input type="checkbox" value="${shift}" class="shiftCheckbox"> ${shift === 'morning' ? 'Morning' : 'Afternoon'}
    //                         </label>
    //                         <div class="timeConfig hidden space-y-2">
    //                             <div class="flex space-x-3">
    //                                 <div class="flex-1">
    //                                     <label class="block text-sm">Start</label>
    //                                     <input type="time" class="border rounded p-1 startTime w-full">
    //                                 </div>
    //                                 <div class="flex-1">
    //                                     <label class="block text-sm">End</label>
    //                                     <input type="time" class="border rounded p-1 endTime w-full">
    //                                 </div>
    //                                 <div class="flex-1">
    //                                     <label class="block text-sm">Slot Duration</label>
    //                                     <select class="border rounded p-1 slotDuration w-full">
    //                                         <option value="30">30 min</option>
    //                                         <option value="60">1 hour</option>
    //                                     </select>
    //                                 </div>
    //                             </div>
    //                             <button type="button" class="generateSlotsBtn bg-primary text-white px-3 py-1 rounded text-sm w-full">
    //                                 Generate Slots <span class="text-xs font-bold text-yellow-200">Required</span>
    //                             </button>
    //                             <div class="generatedSlots text-sm text-green-600 font-medium mt-2 p-2 bg-green-50 rounded border border-green-200"></div>
    //                         </div>
    //                     </div>
    //                 `).join('')}
    //             </div>
    //         </div>`;
    //         dateContainer.appendChild(div);
    //     });

    //     dateContainer.addEventListener('click', (e) => {
    //         if (e.target.classList.contains('removeDateBtn')) {
    //             e.target.closest('div.border').remove();
    //         }
    //         if (e.target.classList.contains('generateSlotsBtn')) {
    //             const config = e.target.closest('.timeConfig');
    //             const start = config.querySelector('.startTime').value;
    //             const end = config.querySelector('.endTime').value;
    //             const duration = parseInt(config.querySelector('.slotDuration').value, 10);
    //             const output = config.querySelector('.generatedSlots');

    //             if (!start || !end || start >= end) {
    //                 Swal.fire({ icon: 'error', title: 'Invalid Time', text: 'Start time must be before end time.' });
    //                 return;
    //             }

    //             const slots = [];
    //             let [h, m] = start.split(':').map(Number);
    //             const [eh, em] = end.split(':').map(Number);

    //             while (h < eh || (h === eh && m < em)) {
    //                 const startTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    //                 let endM = m + duration;
    //                 let endH = h + Math.floor(endM / 60);
    //                 endM = endM % 60;
    //                 if (endH > eh || (endH === eh && endM > em)) break;
    //                 const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    //                 slots.push(`${startTime} - ${endTime}`);
    //                 h = endH; m = endM;
    //             }

    //             output.textContent = `Generated Slots: ${slots.join(', ')}`;
    //             output.dataset.slots = JSON.stringify(slots);
    //         }
    //     });

    //     dateContainer.addEventListener('change', (e) => {
    //         if (e.target.classList.contains('shiftCheckbox')) {
    //             const timeConfig = e.target.closest('.shift-block').querySelector('.timeConfig');
    //             timeConfig.classList.toggle('hidden', !e.target.checked);
    //         }
    //     });

    //     saveSlotsBtn.addEventListener('click', async () => {
    //         const dateBlocks = dateContainer.querySelectorAll('div.border');
    //         const availability = [];

    //         for (const block of dateBlocks) {
    //             const dateInput = block.querySelector('input[type="date"]');
    //             if (!dateInput || !dateInput.value) continue;

    //             const date = dateInput.value;
    //             const shifts = { morning: [], afternoon: [] };
    //             let hasValidShift = false;

    //             const shiftBlocks = block.querySelectorAll('.shift-block');
    //             for (const shiftBlock of shiftBlocks) {
    //                 const checkbox = shiftBlock.querySelector('.shiftCheckbox');
    //                 const generatedSlots = shiftBlock.querySelector('.generatedSlots');

    //                 if (!checkbox || !checkbox.checked || !generatedSlots?.dataset.slots) continue;

    //                 try {
    //                     const slots = JSON.parse(generatedSlots.dataset.slots);
    //                     if (Array.isArray(slots) && slots.length > 0) {
    //                         shifts[checkbox.value] = slots;
    //                         hasValidShift = true;
    //                     }
    //                 } catch (e) {
    //                     console.warn('Invalid slot data:', generatedSlots.dataset.slots);
    //                 }
    //             }

    //             if (hasValidShift) {
    //                 availability.push({ date, shifts });
    //             }
    //         }
    //         if (availability.length === 0) {
    //             Swal.fire({
    //                 icon: 'warning',
    //                 title: 'Incomplete',
    //                 text: 'Please add at least one valid date with shift and generated slots.'
    //             });
    //             return;
    //         }

    //         Swal.fire({ title: 'Saving...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });

    //         try {
    //             const res = await fetch(`${API_BASE_URL}/whatsapp/set-slots`, {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'Authorization': `Bearer ${token}`
    //                 },
    //                 body: JSON.stringify({
    //                     available_dates: availability
    //                 })
    //             });

    //             if (!res.ok) {
    //                 const err = await res.json().catch(() => ({}));
    //                 throw new Error(err.detail || 'Failed to save slots');
    //             }

    //             Swal.fire({
    //                 icon: 'success',
    //                 title: 'Success!',
    //                 text: 'Slots saved.'
    //             });

    //             dateContainer.innerHTML = '';

    //         } catch (err) {
    //             console.error('API Error:', err);
    //             Swal.fire({ icon: 'error', title: 'Failed', text: err.message });
    //         }
    //     });
    // }

    // === SLOTS PAGE – Load, Add, Edit, Save
    async function initSlotsPage() {
        const addDateBtn      = document.getElementById('addDateBtn');
        const dateContainer   = document.getElementById('dateContainer');
        const saveSlotsBtn    = document.getElementById('saveSlotsBtn');

        // -----------------------------------------------------------------
        // 1. Load already saved slots (if any)
        // -----------------------------------------------------------------
        async function loadSavedSlots() {
            try {
                const res = await fetch(`${API_BASE_URL}/whatsapp/slots`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch slots');

                const { available_dates } = await res.json();
                if (!available_dates || available_dates.length === 0) return;

                dateContainer.innerHTML = '';               // clear any UI
                available_dates.forEach(dateObj => addDateBlock(dateObj));
            } catch (e) {
                console.warn('Could not load saved slots →', e);
                // still allow adding new dates
            }
        }

        // -----------------------------------------------------------------
        // 2. Helper – create a date block from DB data
        // -----------------------------------------------------------------
        function addDateBlock(dateObj) {
            if (dateContainer.children.length >= 5) {
                Swal.fire({icon:'warning',title:'Limit',text:'Maximum 5 dates allowed.'});
                return;
            }

            const div = document.createElement('div');
            div.className = 'border rounded-lg p-4 bg-white date-block';
            div.dataset.date = dateObj.date;               // keep the date for later update

            // ---- date input (pre-filled) ----
            const dateInput = `<input type="date" min="${getTomorrow()}" class="border p-2 rounded w-1/2 date-input" value="${dateObj.date}">`;

            // ---- shifts (morning / afternoon) ----
            const shiftHTML = ['morning','afternoon'].map(shift => {
                const checked = (dateObj.shifts[shift] && dateObj.shifts[shift].length > 0) ? 'checked' : '';
                const slots   = dateObj.shifts[shift] || [];
                const startVal = slots.length ? slots[0].split(' - ')[0] : '';
                const endVal = slots.length ? slots[slots.length-1].split(' - ')[1] : '';
                const durVal = slots.length && (slots[1]||'').includes('30') ? 30 : 60;

                const slotRows = slots.map(s => `
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-sm font-medium">${s}</span>
                    </div>`).join('');

                return `
                <div class="shift-block border rounded p-3 bg-gray-50">
                    <label class="flex items-center space-x-2 font-medium mb-2">
                        <input type="checkbox" value="${shift}" class="shiftCheckbox" ${checked}>
                        ${shift === 'morning' ? 'Morning' : 'Afternoon'}
                    </label>

                    <div class="timeConfig ${checked ? '' : 'hidden'} space-y-2">
                        <div class="flex space-x-3">
                            <div class="flex-1"><label class="block text-sm">Start</label>
                                <input type="time" class="border rounded p-1 startTime w-full" value="${startVal}">
                            </div>
                            <div class="flex-1"><label class="block text-sm">End</label>
                                <input type="time" class="border rounded p-1 endTime w-full" value="${endVal}">
                            </div>
                            <div class="flex-1"><label class="block text-sm">Slot Duration</label>
                                <select class="border rounded p-1 slotDuration w-full">
                                    <option value="30" ${durVal === 30 ? 'selected' : ''}>30 min</option>
                                    <option value="60" ${durVal === 60 ? 'selected' : ''}>1 hour</option>
                                </select>
                            </div>
                        </div>

                        <div class="generatedSlots text-sm text-green-600 font-medium mt-2 p-2 bg-green-50 rounded border border-green-200">
                            ${slots.length ? `Generated Slots: ${slots.join(', ')}` : ''}
                        </div>
                    </div>
                </div>`;
            }).join('');

            div.innerHTML = `
                <div class="flex justify-between items-center mb-3">
                    ${dateInput}
                    <button type="button" class="text-red-500 hover:text-red-700 removeDateBtn">Remove</button>
                </div>
                <div class="ml-4 space-y-2">
                    <label class="font-medium">Shifts:</label>
                    <div class="space-y-4">${shiftHTML}</div>
                </div>`;

            dateContainer.appendChild(div);
        }

        // -----------------------------------------------------------------
        // 3. Add a **new** empty date block
        // -----------------------------------------------------------------
        addDateBtn.addEventListener('click', () => {
            if (dateContainer.children.length >= 5) {
                Swal.fire({icon:'warning',title:'Limit Reached',text:'Maximum 5 dates allowed.'});
                return;
            }
            const empty = { date: '', shifts: { morning: [], afternoon: [] } };
            addDateBlock(empty);
        });

        // -----------------------------------------------------------------
        // 4. Remove a block
        // -----------------------------------------------------------------
        dateContainer.addEventListener('click', e => {
            if (e.target.classList.contains('removeDateBtn')) {
                e.target.closest('.date-block').remove();
            }
        });

        // -----------------------------------------------------------------
        // 5. Show / hide time-config when shift checkbox toggles
        // -----------------------------------------------------------------
        dateContainer.addEventListener('change', e => {
            if (e.target.classList.contains('shiftCheckbox')) {
                const cfg = e.target.closest('.shift-block').querySelector('.timeConfig');
                cfg.classList.toggle('hidden', !e.target.checked);
            }
        });

        // -----------------------------------------------------------------
        // 6. Auto-generate slots on input change (start, end, duration)
        // -----------------------------------------------------------------
        dateContainer.addEventListener('input', e => {
            if (e.target.classList.contains('startTime') || 
                e.target.classList.contains('endTime') || 
                e.target.classList.contains('slotDuration')) {

                const cfg    = e.target.closest('.timeConfig');
                const start  = cfg.querySelector('.startTime').value;
                const end    = cfg.querySelector('.endTime').value;
                const dur    = parseInt(cfg.querySelector('.slotDuration').value,10);
                const out    = cfg.querySelector('.generatedSlots');

                if (!start || !end || start >= end || isNaN(dur)) {
                    out.textContent = '';
                    out.dataset.slots = '';
                    return;
                }

                const slots = [];
                let [h,m] = start.split(':').map(Number);
                const [eh,em] = end.split(':').map(Number);

                while (h < eh || (h===eh && m < em)) {
                    const s = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
                    let em_ = m + dur;
                    let eh_ = h + Math.floor(em_/60);
                    em_ = em_%60;
                    if (eh_ > eh || (eh_===eh && em_ > em)) break;
                    const e = `${String(eh_).padStart(2,'0')}:${String(em_).padStart(2,'0')}`;
                    slots.push(`${s} - ${e}`);
                    h = eh_; m = em_;
                }

                out.textContent = `Generated Slots: ${slots.join(', ')}`;
                out.dataset.slots = JSON.stringify(slots);
            }
        });

        // -----------------------------------------------------------------
        // 7. SAVE / UPDATE slots (POST → /whatsapp/set-slots)
        // -----------------------------------------------------------------
        saveSlotsBtn.addEventListener('click', async () => {
            const blocks = dateContainer.querySelectorAll('.date-block');
            const payload = [];

            for (const b of blocks) {
                const date = b.querySelector('.date-input').value;
                if (!date) continue;

                const shifts = { morning: [], afternoon: [] };
                let valid = false;

                b.querySelectorAll('.shift-block').forEach(sb => {
                    const chk = sb.querySelector('.shiftCheckbox');
                    const gen = sb.querySelector('.generatedSlots');
                    if (!chk.checked || !gen.dataset.slots) return;

                    try {
                        const arr = JSON.parse(gen.dataset.slots);
                        if (Array.isArray(arr) && arr.length) {
                            shifts[chk.value] = arr;
                            valid = true;
                        }
                    } catch (_) {}
                });

                if (valid) payload.push({ date, shifts });
            }

            if (payload.length === 0) {
                Swal.fire({icon:'warning',title:'Nothing to save',text:'Add at least one date with generated slots.'});
                return;
            }

            Swal.fire({title:'Saving...',didOpen:()=>Swal.showLoading(),allowOutsideClick:false});

            try {
                const res = await fetch(`${API_BASE_URL}/whatsapp/set-slots`, {
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json',
                        Authorization:`Bearer ${token}`
                    },
                    body:JSON.stringify({available_dates: payload})
                });

                if (!res.ok) {
                    const err = await res.json().catch(()=>({}));
                    throw new Error(err.detail||'Save failed');
                }

                Swal.fire({icon:'success',title:'Saved!',text:'Your interview slots are now up-to-date.'});
            } catch (err) {
                console.error(err);
                Swal.fire({icon:'error',title:'Error',text:err.message});
            }
        });

        // -----------------------------------------------------------------
        // 8. Kick-off – load saved slots when page opens
        // -----------------------------------------------------------------
        loadSavedSlots();
    }

    function getTomorrow() {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    }

    // === SEND MESSAGE TO SELECTED (no modal) ===
    messageCandidatesBtn.addEventListener('click', async () => {
        const selected = document.querySelectorAll('.candidate-checkbox:checked');
        if (selected.length === 0) {
            Swal.fire({ icon: 'warning', title: 'No Selection', text: 'Please select at least one candidate.' });
            return;
        }

        const selectedCandidates = [...selected].map(chk => ({
            name: chk.dataset.name,
            phone: chk.dataset.mobile,
            role: chk.dataset.role,
            reference: chk.dataset.referenceName,
            candidate_id: chk.dataset.cid
        }));

        const role = selectedCandidates[0].role;
        const hrEmail = localStorage.getItem('userEmail');

        Swal.fire({ title: 'Sending...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });

        try {
            const msgRes = await fetch(`${API_BASE_URL}/whatsapp/start-flow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    hr_email: hrEmail,
                    role,
                    candidates: selectedCandidates
                })
            });

            if (!msgRes.ok) {
                const err = await msgRes.json().catch(() => ({}));
                throw new Error(err.detail || 'Failed to send WhatsApp');
            }

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'WhatsApp messages sent.'
            });

        } catch (err) {
            console.error('API Error:', err);
            Swal.fire({ icon: 'error', title: 'Failed', text: err.message });
        }
    });
    
    function getTomorrow() {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    }

    // === SEND MESSAGE TO SELECTED (no modal) ===
    messageCandidatesBtn.addEventListener('click', async () => {
        const selected = document.querySelectorAll('.candidate-checkbox:checked');
        if (selected.length === 0) {
            Swal.fire({ icon: 'warning', title: 'No Selection', text: 'Please select at least one candidate.' });
            return;
        }

        const selectedCandidates = [...selected].map(chk => ({
            name: chk.dataset.name,
            phone: chk.dataset.mobile,
            role: chk.dataset.role,
            reference: chk.dataset.referenceName,
            candidate_id: chk.dataset.cid
        }));

        const role = selectedCandidates[0].role;
        const hrEmail = localStorage.getItem('userEmail');

        Swal.fire({ title: 'Sending...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });

        try {
            const msgRes = await fetch(`${API_BASE_URL}/whatsapp/start-flow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    hr_email: hrEmail,
                    role,
                    candidates: selectedCandidates
                })
            });

            if (!msgRes.ok) {
                const err = await msgRes.json().catch(() => ({}));
                throw new Error(err.detail || 'Failed to send WhatsApp');
            }

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'WhatsApp messages sent.'
            });

        } catch (err) {
            console.error('API Error:', err);
            Swal.fire({ icon: 'error', title: 'Failed', text: err.message });
        }
    });

    // === FILE UPLOAD UI ===
    const resumeFileInput = document.getElementById('resumeFile');
    const fileInfoDiv = document.getElementById('file-info');
    const selectedFileNameSpan = document.getElementById('selectedFileName');
    const clearFileBtn = document.getElementById('clearFileBtn');
    const uploadArea = document.getElementById('upload-area');

    resumeFileInput.addEventListener('change', handleFileSelect);
    clearFileBtn.addEventListener('click', clearFile);

    uploadArea.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() !== 'input') resumeFileInput.click();
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => uploadArea.classList.add('border-primary'), false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('border-primary'), false);
    });
    uploadArea.addEventListener('drop', handleDrop, false);

    function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }
    function handleDrop(e) { resumeFileInput.files = e.dataTransfer.files; handleFileSelect(); }
    function handleFileSelect() {
        if (resumeFileInput.files.length > 0) {
            selectedFileNameSpan.textContent = Array.from(resumeFileInput.files).map(f => f.name).join(', ');
            fileInfoDiv.classList.remove('hidden'); fileInfoDiv.classList.add('flex');
        } else {
            fileInfoDiv.classList.add('hidden'); fileInfoDiv.classList.remove('flex');
        }
    }
    function clearFile() {
        resumeFileInput.value = '';
        fileInfoDiv.classList.add('hidden'); fileInfoDiv.classList.remove('flex');
    }

    // === UPLOAD RESUME ===
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.addEventListener('click', async () => {
        const referenceName = document.getElementById('referenceName').value.trim();
        const resumeFiles = document.getElementById('resumeFile').files;

        if (!referenceName || resumeFiles.length === 0) {
            Swal.fire({ icon: 'error', title: 'Oops...', text: 'Reference Name and Resume required.' });
            return;
        }

        const formData = new FormData();
        formData.append('reference_name', referenceName);
        for (let i = 0; i < resumeFiles.length; i++) formData.append('resumes', resumeFiles[i]);

        Swal.fire({ title: 'Uploading...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });

        try {
            const response = await fetch(`${API_BASE_URL}/upload-resumes/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();

            if (response.ok) {
                Swal.fire({ icon: 'success', title: 'Success!', text: data.message || 'Uploaded!' });
                document.getElementById('referenceName').value = '';
                clearFile();
                if (!document.getElementById('candidates-page').classList.contains('hidden')) fetchCandidates();
            } else {
                throw new Error(data.detail || 'Upload failed');
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        }
    });

    // === MATCH RESUMES ===
    const matchBtn = document.getElementById('matchBtn');
    const candidatesBody = document.getElementById('candidatesBody');
    const exportExcelBtn = document.getElementById('exportExcelBtn');

    matchBtn.addEventListener('click', async () => {
        const role = document.getElementById('role').value.trim();
        const jd = document.getElementById('jd').value.trim();
        const threshold = document.getElementById('threshold').value;

        if (!role || !jd) {
            Swal.fire({ icon: 'error', title: 'Missing Info', text: 'Role and JD required.' });
            return;
        }

        const payload = { role, jd };
        if (threshold) payload.threshold = parseFloat(threshold);

        Swal.fire({ title: 'Matching...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });

        try {
            const response = await fetch(`${API_BASE_URL}/match-resumes/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (response.ok) {
                displayCandidates(data.matched_candidates);
                document.getElementById('matchResults').classList.remove('hidden');
                Swal.close();
            } else {
                throw new Error(data.detail || 'Matching failed');
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        }
    });

    function displayCandidates(candidates) {
        candidatesBody.innerHTML = '';
        if (!candidates || candidates.length === 0) {
            candidatesBody.innerHTML = '<tr><td colspan="9" class="text-center text-gray-500 py-4">No matches found.</td></tr>';  // Updated colspan
            return;
        }

        candidates.forEach(c => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4"><input type="checkbox" class="candidate-checkbox" data-cid="${c.candidate_id}" data-name="${c.name}" data-mobile="${c.phone}" data-email="${c.email}" data-role="${c.role}" data-reference-name="${c.reference || 'Unknown'}"></td>
                <td class="px-6 py-4">${c.reference || 'Unknown'}</td>
                <td class="px-6 py-4">${c.name}</td>
                <td class="px-6 py-4">${c.email}</td>
                <td class="px-6 py-4">${c.phone}</td>
                <td class="px-6 py-4">${c.role}</td>
                <td class="px-6 py-4">${c.score}%</td>
                <td class="px-6 py-4">${c.status}</td> <!-- Added Status -->
                <td class="px-6 py-4"><button class="view-resume-btn btn-primary py-1 px-2 rounded" data-cid="${c.candidate_id}"><i data-feather="eye"></i></button></td>
            `;
            candidatesBody.appendChild(row);
        });
        feather.replace();
    }

    // === VIEW RESUME (for match page) ===
    candidatesBody.addEventListener('click', async (e) => {
        const viewBtn = e.target.closest('.view-resume-btn');
        if (!viewBtn) return;

        const candidateId = viewBtn.dataset.cid;
        viewResume(candidateId);
    });

    // Global view resume function
    async function viewResume(candidateId) {
        try {
            const response = await fetch(`${API_BASE_URL}/get-resume/${candidateId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch resume');

            const blob = await response.blob();
            const fileName = response.headers.get('Content-Disposition')?.split('filename=')[1] || `resume_${candidateId}.pdf`;
            const ext = fileName.split('.').pop().toLowerCase();

            let html = '';
            if (ext === 'pdf') {
                const url = URL.createObjectURL(blob);
                html = `<iframe class="pdf-viewer w-full h-96" src="${url}"></iframe>`;
            } else {
                const text = await blob.text();
                html = `<pre class="whitespace-pre-wrap p-4 bg-gray-100 rounded">${text}</pre>`;
            }

            Swal.fire({ title: 'Resume', html, showCloseButton: true, customClass: { popup: 'max-w-4xl' } });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        }
    }

    // === CANDIDATES PAGE ===
    async function fetchLocations() {
        try {
            const response = await fetch(`${API_BASE_URL}/locations`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            const select = document.getElementById('location');
            select.innerHTML = '<option value="">All Locations</option>';
            data.locations.forEach(loc => {
                const opt = document.createElement('option');
                opt.value = loc; opt.textContent = loc || 'N/A';
                select.appendChild(opt);
            });
        } catch (error) {
            console.error('Locations error:', error);
        }
    }

    async function fetchCandidates() {
        const params = new URLSearchParams();

        ['candidateSearch', 'experience', 'location', 'qualification'].forEach(id => {
            const val = document.getElementById(id).value.trim();
            if (val) params.append(id === 'candidateSearch' ? 'search' : id, val);
        });

        try {
            const response = await fetch(`${API_BASE_URL}/candidates/?${params}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Failed');
            displayCandidateCards(data.candidates);
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        }
    }

    function capitalizeWords(str) {
        return str.replace(/\b\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    }

    function displayCandidateCards(candidates) {
        const container = document.getElementById('candidatesContainer');
        container.innerHTML = '';
        if (!candidates || candidates.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500 py-4">No candidates found.</p>';
            return;
        }

        candidates.forEach(c => {
            const exp = c.experience_value ? capitalizeWords(c.experience_value) : 'N/A';
            const loc = c.LocationExact ? capitalizeWords(c.LocationExact) : 'N/A';
            const qual = c.QualificationExact ? capitalizeWords(c.QualificationExact) : 'N/A';

            const card = document.createElement('div');
            card.className = 'candidate-card';
            card.innerHTML = `
                <i data-feather="eye" class="candidate-eye-icon text-gray-500 hover:text-primary" data-cid="${c.candidate_id}"></i>
                <div class="content">
                    <h3 class="text-lg font-semibold">${c.name || 'Unknown'}</h3>
                    <p><strong>Reference:</strong> ${c.reference_name || 'N/A'}</p>
                    <p><strong>Experience:</strong> ${exp === "0" ? "Fresher" : exp}</p>
                    <p><strong>Location:</strong> ${loc}</p>
                    <p><strong>Qualification:</strong> ${qual}</p>
                    <p><strong>Roles:</strong> ${c.relevant_roles?.join(', ') || 'N/A'}</p>
                    <p><strong>Certifications:</strong> ${Array.isArray(c.certifications) ? c.certifications.join(', ') : c.certifications || 'N/A'}</p>
                </div>
                <div class="see-more" onclick="this.parentElement.classList.toggle('expanded')">See More</div>
            `;
            container.appendChild(card);
        });
        feather.replace();
    }

    document.getElementById('candidateSearch').addEventListener('input', fetchCandidates);
    document.getElementById('applyFiltersBtn').addEventListener('click', fetchCandidates);
    document.getElementById('clearFiltersBtn').addEventListener('click', () => {
        ['candidateSearch', 'experience', 'location', 'qualification'].forEach(id => document.getElementById(id).value = '');
        fetchCandidates();
    });

    exportExcelBtn.addEventListener('click', () => {
        Swal.fire({ icon: 'info', title: 'Coming Soon', text: 'Export to Excel feature.' });
    });

    document.getElementById('candidatesContainer').addEventListener('click', async (e) => {
        const viewBtn = e.target.closest('.candidate-eye-icon');
        if (!viewBtn) return;

        const candidateId = viewBtn.dataset.cid;
        viewResume(candidateId);
    });

    // === MESSAGED PAGE ===
    async function fetchMessaged() {
        try {
            const response = await fetch(`${API_BASE_URL}/messaged`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            const container = document.getElementById('messaged-container');
            container.innerHTML = '';
            if (!data.messaged || data.messaged.length === 0) {
                container.innerHTML = '<p class="text-center text-gray-500 py-4 col-span-full">No messaged candidates.</p>';
                return;
            }
            data.messaged.forEach(c => {
                const card = document.createElement('div');
                card.className = 'border rounded-lg p-4 bg-white shadow';
                card.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-lg font-semibold">${c.candidate_name}</h3>
                            <p><strong>Role:</strong> ${c.role}</p>
                            <p><strong>Phone:</strong> ${c.candidate_number}</p>
                            <p><strong>Status:</strong> ${c.status}</p>
                        </div>
                        <div class="flex space-x-2">
                            <button class="view-resume text-primary" data-cid="${c.candidate_id}"><i data-feather="file-text"></i></button>
                            <button class="view-convo text-primary" data-cid="${c.candidate_id}"><i data-feather="message-square"></i></button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
            feather.replace();
        } catch (error) {
            console.error('Messaged error:', error);
        }
    }

    // Event listener for messaged page icons
    document.getElementById('messaged-container').addEventListener('click', async (e) => {
        if (e.target.closest('.view-resume')) {
            const cid = e.target.closest('.view-resume').dataset.cid;
            viewResume(cid);
        }
        if (e.target.closest('.view-convo')) {
            Swal.fire({ icon: 'info', title: 'Coming Soon', text: 'Conversation history modal.' });
        }
    });

    // === SCHEDULED PAGE ===
    async function fetchScheduled() {
        try {
            const response = await fetch(`${API_BASE_URL}/scheduled`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            const container = document.getElementById('scheduled-container');
            container.innerHTML = '';
            if (!data.scheduled || data.scheduled.length === 0) {
                container.innerHTML = '<p class="text-center text-gray-500 py-4 col-span-full">No scheduled interviews.</p>';
                return;
            }
            data.scheduled.forEach(c => {
                const card = document.createElement('div');
                card.className = 'border rounded-lg p-4 bg-white shadow';
                card.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-lg font-semibold">${c.candidate_name}</h3>
                            <p><strong>Role:</strong> ${c.role}</p>
                            <p><strong>Phone:</strong> ${c.candidate_number}</p>
                            <p><strong>Date:</strong> ${c.date}</p>
                            <p><strong>Slot:</strong> ${c.slot}</p>
                            <p><strong>Status:</strong> ${c.status}</p>
                        </div>
                        <div class="flex space-x-2">
                            <button class="view-resume text-primary" data-cid="${c.candidate_id}"><i data-feather="file-text"></i></button>
                            <button class="view-convo text-primary" data-cid="${c.candidate_id}"><i data-feather="message-square"></i></button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
            feather.replace();
        } catch (error) {
            console.error('Scheduled error:', error);
        }
    }

    // Event listener for scheduled page icons
    document.getElementById('scheduled-container').addEventListener('click', async (e) => {
        if (e.target.closest('.view-resume')) {
            const cid = e.target.closest('.view-resume').dataset.cid;
            viewResume(cid);
        }
        if (e.target.closest('.view-convo')) {
            Swal.fire({ icon: 'info', title: 'Coming Soon', text: 'Conversation history modal.' });
        }
    });
});