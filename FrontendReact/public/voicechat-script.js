
        // ===== DONNÉES DES TARIFS =====
        const TARIFFS_DATA = {
            consultations: {
                title: '💊 Consultations Médicales',
                titleAr: '💊 الاستشارات الطبية',
                items: {
                    'Médecin généraliste': { tariff: '25 DT', rate: '70%' },
                    'Médecin spécialiste': { tariff: '40 DT', rate: '70%'},
                    'Consultation urgence': { tariff: '35 DT', rate: '70%' },
                    'Visite à domicile': { tariff: '50 DT', rate: '70%'}
                },
                itemsAr: {
                    'طبيب عام': { tariff: '25 دينار', rate: '70%', reimbursed: '17,5 دينار' },
                    'طبيب مختص': { tariff: '40 دينار', rate: '70%', reimbursed: '28 دينار' },
                    'استشارة طارئة': { tariff: '35 دينار', rate: '70%', reimbursed: '24,5 دينار' },
                    'زيارة منزلية': { tariff: '50 دينار', rate: '70%', reimbursed: '35 دينار' }
                }
            },
            medicaments: {
                title: '🏥 Médicaments',
                titleAr: '🏥 الأدوية',
                items: {
                    'Liste A (Essentiels)': { rate: '85%', description: 'Médicaments vitaux' },
                    'Liste B (Importants)': { rate: '70%', description: 'Médicaments importants' },
                    'Liste C (Complémentaires)': { rate: '40%', description: 'Médicaments complémentaires' },
                    'Médicaments génériques': { rate: '85%', description: 'Encouragés par la CNAM' }
                },
                itemsAr: {
                    'القائمة الأولى (أساسية)': { rate: '85%', description: 'أدوية حيوية' },
                    'القائمة الثانية (مهمة)': { rate: '70%', description: 'أدوية مهمة' },
                    'القائمة الثالثة (تكميلية)': { rate: '40%', description: 'أدوية تكميلية' },
                    'الأدوية الجنيسة': { rate: '85%', description: 'مشجعة من الصندوق الوطني' }
                }
            },
            hospitalisation: {
                title: '🔬 Hospitalisation',
                titleAr: '🔬 الاستشفاء',
                items: {
                    'Secteur public': { rate: '90%', description: 'Hôpitaux publics conventionnés' },
                    'Secteur privé': { rate: '70%', description: 'Cliniques conventionnées' },
                    'Chirurgie': { rate: '85%', description: 'Interventions chirurgicales' },
                    'Soins intensifs': { rate: '95%', description: 'Réanimation et urgences' }
                },
                itemsAr: {
                    'القطاع العام': { rate: '90%', description: 'المستشفيات العمومية المتعاقدة' },
                    'القطاع الخاص': { rate: '70%', description: 'العيادات المتعاقدة' },
                    'الجراحة': { rate: '85%', description: 'العمليات الجراحية' },
                    'العناية المركزة': { rate: '95%', description: 'الإنعاش والطوارئ' }
                }
            },
            examens: {
                title: '📋 Analyses et Examens',
                titleAr: '📋 التحاليل والفحوصات',
                items: {
                    'Biologie médicale': { rate: '70%', description: 'Analyses sanguines, urinaires' },
                    'Imagerie médicale': { rate: '70%', description: 'Radio, échographie, scanner' },
                    'ECG/EEG': { rate: '70%', description: 'Examens électriques' },
                    'Soins dentaires': { rate: '70%', description: 'Soins conservateurs' }
                },
                itemsAr: {
                    'البيولوجيا الطبية': { rate: '70%', description: 'تحاليل الدم والبول' },
                    'التصوير الطبي': { rate: '70%', description: 'أشعة، تصوير بالموجات، أشعة مقطعية' },
                    'تخطيط القلب/الدماغ': { rate: '70%', description: 'فحوصات كهربائية' },
                    'طب الأسنان': { rate: '70%', description: 'العلاجات التحفظية' }
                }
            }
        };

        class VoiceChat {
            constructor() {
                this.isRecording = false;
                this.recognition = null;
                this.speechSynthesis = window.speechSynthesis;
                this.currentUtterance = null;
                this.voices = [];
                this.currentLanguage = 'fr'; // fr ou ar
                
                // Paramètres vocaux personnalisables
                this.voiceSettings = {
                    voice: null,
                    rate: 0.9,
                    pitch: 1.0,
                    volume: 1.0
                };
                
                // Cache des voix par langue
                this.arabicVoices = [];
                this.frenchVoices = [];
                this.voicesLoaded = false;
                
                this.initElements();
                this.initEventListeners();
                this.initSpeechRecognition();
                this.initSpeechSynthesis();
                this.loadVoiceSettings();
                this.loadLanguageSettings();
            }
            
            initElements() {
                this.chatMessages = document.getElementById('chatMessages');
                this.textInput = document.getElementById('textInput');
                this.sendBtn = document.getElementById('sendBtn');
                this.voiceBtn = document.getElementById('voiceBtn');
                this.loading = document.getElementById('loading');
                this.status = document.getElementById('status');
                
                // Éléments de contrôle vocal
                this.voiceSelect = document.getElementById('voiceSelect');
                this.rateSlider = document.getElementById('rateSlider');
                this.pitchSlider = document.getElementById('pitchSlider');
                this.volumeSlider = document.getElementById('volumeSlider');
                this.rateValue = document.getElementById('rateValue');
                this.pitchValue = document.getElementById('pitchValue');
                this.volumeValue = document.getElementById('volumeValue');
                this.voiceStatus = document.getElementById('voiceStatus');
            }
            
            initEventListeners() {
                this.sendBtn.addEventListener('click', () => this.sendMessage());
                this.textInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.sendMessage();
                });
                this.voiceBtn.addEventListener('click', () => this.toggleRecording());
                
                // Événements pour les contrôles vocaux
                this.voiceSelect.addEventListener('change', (e) => {
                    try {
                        const selectedVoice = this.voices.find(voice => voice.name === e.target.value);
                        if (selectedVoice) {
                            this.voiceSettings.voice = selectedVoice;
                            this.saveVoiceSettings();
                            this.updateVoiceStatus(`Voix sélectionnée: ${selectedVoice.name}`);
                        }
                    } catch (error) {
                        console.error('Erreur lors du changement de voix:', error);
                    }
                });
                
                this.rateSlider.addEventListener('input', (e) => {
                    this.voiceSettings.rate = parseFloat(e.target.value);
                    this.rateValue.textContent = e.target.value;
                    this.saveVoiceSettings();
                });
                
                this.pitchSlider.addEventListener('input', (e) => {
                    this.voiceSettings.pitch = parseFloat(e.target.value);
                    this.pitchValue.textContent = e.target.value;
                    this.saveVoiceSettings();
                });
                
                this.volumeSlider.addEventListener('input', (e) => {
                    this.voiceSettings.volume = parseFloat(e.target.value);
                    this.volumeValue.textContent = e.target.value;
                    this.saveVoiceSettings();
                });
            }
            
            initSpeechRecognition() {
                if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                    this.voiceBtn.style.display = 'none';
                    this.updateStatus('Reconnaissance vocale non supportée');
                    return;
                }
                
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                this.recognition = new SpeechRecognition();
                
                this.recognition.continuous = false;
                this.recognition.interimResults = false;
                this.recognition.maxAlternatives = 1;
                
                this.updateRecognitionLanguage();
                
                this.recognition.onstart = () => {
                    this.isRecording = true;
                    this.voiceBtn.classList.add('recording');
                    this.voiceBtn.textContent = '⏹️';
                    const listeningText = this.currentLanguage === 'ar' ? 
                        '🎤 أستمع إليك...' : '🎤 Je vous écoute...';
                    this.updateStatus(listeningText);
                };
                
                this.recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    this.textInput.value = transcript;
                    const transcribedText = this.currentLanguage === 'ar' ? 
                        `✅ تم التعرف: "${transcript}"` : `✅ Transcrit: "${transcript}"`;
                    this.updateStatus(transcribedText);
                    
                    setTimeout(() => {
                        this.sendMessage();
                        this.updateStatus('');
                    }, 1500);
                };
                
                this.recognition.onerror = (event) => {
                    let errorMessage = this.currentLanguage === 'ar' ? 
                        'خطأ في التعرف على الصوت' : 'Erreur de reconnaissance vocale';
                    
                    switch(event.error) {
                        case 'no-speech': 
                            errorMessage = this.currentLanguage === 'ar' ? 
                                'لم يتم اكتشاف كلام' : 'Aucune parole détectée'; 
                            break;
                        case 'audio-capture': 
                            errorMessage = this.currentLanguage === 'ar' ? 
                                'لا يمكن الوصول للميكروفون' : 'Microphone non accessible'; 
                            break;
                        case 'not-allowed': 
                            errorMessage = this.currentLanguage === 'ar' ? 
                                'تم رفض إذن الميكروفون' : 'Permission microphone refusée'; 
                            break;
                        case 'network': 
                            errorMessage = this.currentLanguage === 'ar' ? 
                                'خطأ في الشبكة' : 'Erreur réseau'; 
                            break;
                    }
                    this.showError(errorMessage);
                    this.stopRecording();
                };
                
                this.recognition.onend = () => this.stopRecording();
            }
            
            updateRecognitionLanguage() {
                if (this.recognition) {
                    this.recognition.lang = this.currentLanguage === 'ar' ? 'ar-TN' : 'fr-FR';
                }
            }
            
            initSpeechSynthesis() {
                if (!this.speechSynthesis) {
                    console.log('Synthèse vocale non supportée');
                    document.getElementById('voiceSettings').style.display = 'none';
                    return;
                }
                
                this.updateVoiceStatus('Initialisation de la synthèse vocale...');
                
                // Forcer le chargement des voix de manière intensive
                this.loadVoicesWithRetry();
                
                this.speechSynthesis.onvoiceschanged = () => {
                    console.log('Événement voiceschanged détecté');
                    this.loadVoicesWithRetry();
                };
            }
            
            async loadVoicesWithRetry() {
                let attempts = 0;
                const maxAttempts = 10;
                
                const tryLoad = () => {
                    attempts++;
                    console.log(`Tentative ${attempts} de chargement des voix`);
                    
                    this.voices = this.speechSynthesis.getVoices();
                    
                    if (this.voices.length === 0 && attempts < maxAttempts) {
                        setTimeout(tryLoad, 100 * attempts); // Délai croissant
                        return;
                    }
                    
                    if (this.voices.length > 0) {
                        this.voicesLoaded = true;
                        this.categorizeVoices();
                        this.populateVoiceSelect();
                        this.selectDefaultVoice();
                        this.updateVoiceStatus(`${this.voices.length} voix chargées avec succès`);
                    } else {
                        this.updateVoiceStatus('Aucune voix disponible');
                    }
                };
                
                tryLoad();
            }
            
            categorizeVoices() {
                this.arabicVoices = [];
                this.frenchVoices = [];
                
                console.log('=== ANALYSE COMPLÈTE DES VOIX ===');
                
                this.voices.forEach((voice, index) => {
                    const info = {
                        index,
                        name: voice.name,
                        lang: voice.lang,
                        localService: voice.localService,
                        default: voice.default
                    };
                    
                    console.log(`Voix ${index}:`, info);
                    
                    // Classification élargie pour l'arabe
                    const isArabic = this.isArabicVoice(voice);
                    const isFrench = this.isFrenchVoice(voice);
                    
                    if (isArabic) {
                        this.arabicVoices.push(voice);
                        console.log(`✅ ARABE: ${voice.name} (${voice.lang})`);
                    } else if (isFrench) {
                        this.frenchVoices.push(voice);
                        console.log(`✅ FRANÇAIS: ${voice.name} (${voice.lang})`);
                    }
                });
                
                console.log(`=== RÉSUMÉ ===`);
                console.log(`Voix arabes: ${this.arabicVoices.length}`);
                console.log(`Voix françaises: ${this.frenchVoices.length}`);
                
                // Trier par préférence (locales en premier)
                this.arabicVoices.sort((a, b) => b.localService - a.localService);
                this.frenchVoices.sort((a, b) => b.localService - a.localService);
            }
            
            isArabicVoice(voice) {
                const name = voice.name.toLowerCase();
                const lang = voice.lang ? voice.lang.toLowerCase() : '';
                
                // Vérifications spécifiques pour l'arabe
                const arabicIndicators = [
                    // Langues arabes
                    lang.startsWith('ar'),
                    lang.includes('arabic'),
                    
                    // Noms de voix arabes connus
                    name.includes('hoda'),
                    name.includes('naayf'),
                    name.includes('laila'),
                    name.includes('omar'),
                    name.includes('salma'),
                    name.includes('arabic'),
                    name.includes('عربي'),
                    name.includes('عرب'),
                    
                    // Codes pays arabes
                    lang.includes('sa'), // Arabie Saoudite
                    lang.includes('eg'), // Égypte
                    lang.includes('tn'), // Tunisie
                    lang.includes('ma'), // Maroc
                    lang.includes('ae'), // Émirats
                    lang.includes('kw'), // Koweït
                    lang.includes('qa'), // Qatar
                    lang.includes('bh'), // Bahreïn
                    lang.includes('jo'), // Jordanie
                    lang.includes('lb'), // Liban
                    lang.includes('sy'), // Syrie
                    lang.includes('iq'), // Irak
                    lang.includes('ye'), // Yémen
                    lang.includes('om'), // Oman
                    
                    // Voix Microsoft en arabe
                    (name.includes('microsoft') && (lang.startsWith('ar') || name.includes('hoda') || name.includes('naayf'))),
                    
                    // Google voices
                    (name.includes('google') && lang.startsWith('ar'))
                ];
                
                return arabicIndicators.some(indicator => indicator);
            }
            
            isFrenchVoice(voice) {
                const name = voice.name.toLowerCase();
                const lang = voice.lang ? voice.lang.toLowerCase() : '';
                
                return lang.startsWith('fr') || 
                       name.includes('french') ||
                       name.includes('français') ||
                       name.includes('france') ||
                       lang.includes('fr-');
            }
            
            selectDefaultVoice() {
                if (!this.voicesLoaded) return;
                
                let targetVoices = this.currentLanguage === 'ar' ? this.arabicVoices : this.frenchVoices;
                
                if (targetVoices.length === 0) {
                    console.log(`Aucune voix spécifique pour ${this.currentLanguage}, utilisation de voix générique`);
                    targetVoices = this.voices.slice(0, 3); // Prendre quelques voix par défaut
                }
                
                // Préférer les voix locales
                const localVoice = targetVoices.find(voice => voice.localService);
                this.voiceSettings.voice = localVoice || targetVoices[0];
                
                if (this.voiceSettings.voice) {
                    console.log(`Voix sélectionnée pour ${this.currentLanguage}:`, this.voiceSettings.voice.name);
                    this.voiceSelect.value = this.voiceSettings.voice.name;
                    this.updateVoiceStatus(`Voix active: ${this.voiceSettings.voice.name} (${this.voiceSettings.voice.lang || 'sans langue'})`);
                }
                
                this.saveVoiceSettings();
            }
            
            populateVoiceSelect() {
                this.voiceSelect.innerHTML = '';
                
                if (!this.voicesLoaded || this.voices.length === 0) {
                    const noVoiceText = this.currentLanguage === 'ar' ? 
                        'لا توجد أصوات متاحة' : 'Aucune voix disponible';
                    this.voiceSelect.innerHTML = `<option>${noVoiceText}</option>`;
                    return;
                }
                
                const targetVoices = this.currentLanguage === 'ar' ? this.arabicVoices : this.frenchVoices;
                
                if (targetVoices.length === 0) {
                    // Si aucune voix spécifique, montrer toutes les voix
                    const allVoicesText = this.currentLanguage === 'ar' ? 
                        'جميع الأصوات المتاحة' : 'Toutes les voix disponibles';
                    
                    const option = document.createElement('option');
                    option.disabled = true;
                    option.textContent = `--- ${allVoicesText} ---`;
                    this.voiceSelect.appendChild(option);
                    
                    this.voices.slice(0, 10).forEach(voice => {
                        const option = document.createElement('option');
                        option.value = voice.name;
                        option.textContent = `${voice.name} (${voice.lang || 'sans langue'})`;
                        this.voiceSelect.appendChild(option);
                    });
                } else {
                    // Afficher les voix de la langue cible
                    const langLabel = this.currentLanguage === 'ar' ? 
                        'الأصوات العربية' : 'Voix françaises';
                    
                    const option = document.createElement('option');
                    option.disabled = true;
                    option.textContent = `--- ${langLabel} ---`;
                    this.voiceSelect.appendChild(option);
                    
                    targetVoices.forEach(voice => {
                        const option = document.createElement('option');
                        option.value = voice.name;
                        const localText = this.currentLanguage === 'ar' ? '(محلي)' : '(Local)';
                        const onlineText = this.currentLanguage === 'ar' ? '(عبر الإنترنت)' : '(Online)';
                        option.textContent = `${voice.name} (${voice.lang || 'sans langue'}) ${voice.localService ? localText : onlineText}`;
                        this.voiceSelect.appendChild(option);
                    });
                }
                
                if (this.voiceSettings.voice) {
                    this.voiceSelect.value = this.voiceSettings.voice.name;
                }
            }
            
            toggleLanguage() {
                this.currentLanguage = this.currentLanguage === 'fr' ? 'ar' : 'fr';
                this.updateUI();
                this.updateRecognitionLanguage();
                this.selectDefaultVoice();
                this.populateVoiceSelect();
                this.saveLanguageSettings();
            }
            
            updateUI() {
                const isArabic = this.currentLanguage === 'ar';
                
                // Mise à jour des textes de l'interface
                const translations = {
                    fr: {
                        headerTitle: '🏥 Expert Assurance-Maladie | Loi n° 2004-71',
                        voiceSettings: 'Paramètres Vocaux',
                        voiceLabel: '🎤 Voix française :',
                        speedLabel: 'Vitesse',
                        pitchLabel: 'Tonalité',
                        volumeLabel: 'Volume',
                        testVoice: 'Tester la voix',
                        placeholder: 'Ex: Quel est le tarif de remboursement pour un médecin généraliste ?',
                        loading: 'Traitement en cours...',
                        calculatorTitle: 'Calculateur de Cotisations',
                        calculateBtn: 'Calculer',
                        consultationsBtn: 'Consultations',
                        medicamentsBtn: 'Médicaments',
                        hospitalisationBtn: 'Hospitalisation',
                        examensBtn: 'Examens',
                        welcomeText: `🎙️ <strong>Nouveau : Personnalisez ma voix !</strong>
                        <br>• Cliquez sur "Paramètres Vocaux" en haut
                        <br>• Choisissez une voix, vitesse, tonalité
                        <br>• Testez avec le bouton "Tester la voix"
                        <br><br>
                        📋 <strong>Mes spécialités :</strong>
                        <br>• Tarifs et remboursements CNAM
                        <br>• Calcul des cotisations (Article 15)
                        <br>• Droits des assurés et ayants droit
                        <br>• Procédures administratives
                        <br>• Contentieux et recours
                        <br><br>
                        💬 Posez-moi vos questions !`
                    },
                    ar: {
                        headerTitle: '🏥 خبير التأمين الصحي | القانون عدد 71 لسنة 2004',
                        voiceSettings: 'إعدادات الصوت',
                        voiceLabel: '🎤 الصوت العربي :',
                        speedLabel: 'السرعة',
                        pitchLabel: 'النبرة',
                        volumeLabel: 'الصوت',
                        testVoice: 'اختبار الصوت',
                        placeholder: 'مثال: ما هي تعريفة استرداد الطبيب العام؟',
                        loading: 'جارٍ المعالجة...',
                        calculatorTitle: 'حاسبة الاشتراكات',
                        calculateBtn: 'احسب',
                        consultationsBtn: 'الاستشارات',
                        medicamentsBtn: 'الأدوية',
                        hospitalisationBtn: 'الاستشفاء',
                        examensBtn: 'الفحوصات',
                        welcomeText: `🎙️ <strong>جديد: اضبط صوتي!</strong>
                        <br>• انقر على "إعدادات الصوت" في الأعلى
                        <br>• اختر صوتاً وسرعة ونبرة
                        <br>• اختبر بزر "اختبار الصوت"
                        <br><br>
                        📋 <strong>تخصصاتي:</strong>
                        <br>• تعريفات واسترداد الصندوق الوطني
                        <br>• حساب الاشتراكات (المادة 15)
                        <br>• حقوق المؤمن لهم وذوي الحقوق
                        <br>• الإجراءات الإدارية
                        <br>• النزاعات والطعون
                        <br><br>
                        💬 اطرح أسئلتك!`
                    }
                };
                
                const texts = translations[this.currentLanguage];
                
                // Mise à jour des éléments
                document.getElementById('headerTitle').textContent = texts.headerTitle;
                document.getElementById('voiceSettingsText').textContent = texts.voiceSettings;
                document.getElementById('voiceSelectLabel').textContent = texts.voiceLabel;
                document.getElementById('speedLabel').textContent = texts.speedLabel;
                document.getElementById('pitchLabel').textContent = texts.pitchLabel;
                document.getElementById('volumeLabel').textContent = texts.volumeLabel;
                document.getElementById('testVoiceText').textContent = texts.testVoice;
                document.getElementById('loadingText').textContent = texts.loading;
                document.getElementById('calculatorTitle').textContent = texts.calculatorTitle;
                document.getElementById('calculateBtn').textContent = texts.calculateBtn;
                document.getElementById('consultationsBtn').textContent = texts.consultationsBtn;
                document.getElementById('medicamentsBtn').textContent = texts.medicamentsBtn;
                document.getElementById('hospitalisationBtn').textContent = texts.hospitalisationBtn;
                document.getElementById('examensBtn').textContent = texts.examensBtn;
                document.getElementById('welcomeText').innerHTML = texts.welcomeText;
                
                this.textInput.placeholder = texts.placeholder;
                
                // Gestion RTL pour l'arabe
                if (isArabic) {
                    this.textInput.classList.add('arabic');
                    document.body.style.direction = 'rtl';
                    document.documentElement.lang = 'ar';
                } else {
                    this.textInput.classList.remove('arabic');
                    document.body.style.direction = 'ltr';
                    document.documentElement.lang = 'fr';
                }
                
                // Animation de transition
                document.querySelector('.chat-container').classList.add('fade-transition');
                setTimeout(() => {
                    document.querySelector('.chat-container').classList.remove('fade-transition');
                }, 300);
            }
            
            speakText(button, text, forceLanguage = null) {
                if (!this.speechSynthesis) {
                    this.showError(this.currentLanguage === 'ar' ? 
                        'الصوت غير مدعوم' : 'Synthèse vocale non supportée');
                    return;
                }
                
                // Arrêter toute lecture en cours
                if (this.speechSynthesis.speaking) {
                    this.speechSynthesis.cancel();
                    button.textContent = '🔊';
                    button.classList.remove('playing');
                    return;
                }
                
                const cleanText = this.cleanTextForSpeech(text);
                
                if (!cleanText || cleanText.length === 0) {
                    this.showError(this.currentLanguage === 'ar' ? 
                        'لا يوجد نص صالح للقراءة' : 'Aucun texte valide à lire');
                    return;
                }
                
                // Déterminer la langue à utiliser
                const targetLanguage = forceLanguage || this.currentLanguage;
                
                console.log('=== DÉBUT SYNTHÈSE VOCALE ===');
                console.log('Langue cible:', targetLanguage);
                console.log('Texte:', cleanText.substring(0, 100) + '...');
                
                try {
                    this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
                    
                    // Sélection de la voix selon la langue
                    const targetVoices = targetLanguage === 'ar' ? this.arabicVoices : this.frenchVoices;
                    let selectedVoice = null;
                    
                    if (targetVoices.length > 0) {
                        // Préférer la voix actuelle si elle correspond à la langue
                        if (this.voiceSettings.voice && targetVoices.includes(this.voiceSettings.voice)) {
                            selectedVoice = this.voiceSettings.voice;
                        } else {
                            // Sinon, prendre la première voix locale ou la première disponible
                            selectedVoice = targetVoices.find(v => v.localService) || targetVoices[0];
                        }
                    }
                    
                    // Configuration de la voix
                    if (selectedVoice) {
                        this.currentUtterance.voice = selectedVoice;
                        this.currentUtterance.lang = selectedVoice.lang;
                        console.log('Voix sélectionnée:', selectedVoice.name, selectedVoice.lang);
                    } else {
                        // Fallback: définir juste la langue
                        this.currentUtterance.lang = targetLanguage === 'ar' ? 'ar-SA' : 'fr-FR';
                        console.log('Aucune voix spécifique, langue forcée:', this.currentUtterance.lang);
                    }
                    
                    // Paramètres de lecture
                    this.currentUtterance.rate = Math.max(0.1, Math.min(2.0, this.voiceSettings.rate));
                    this.currentUtterance.pitch = Math.max(0.1, Math.min(2.0, this.voiceSettings.pitch));
                    this.currentUtterance.volume = Math.max(0.1, Math.min(1.0, this.voiceSettings.volume));
                    
                    // Événements
                    this.currentUtterance.onstart = () => {
                        console.log('🎵 Lecture démarrée');
                        button.textContent = '⏸️';
                        button.classList.add('playing');
                    };
                    
                    this.currentUtterance.onend = () => {
                        console.log('🎵 Lecture terminée');
                        button.textContent = '🔊';
                        button.classList.remove('playing');
                    };
                    
                    this.currentUtterance.onerror = (event) => {
                        console.error('❌ Erreur de lecture:', event.error);
                        button.textContent = '🔊';
                        button.classList.remove('playing');
                        
                        let errorMsg = 'Erreur de lecture: ' + event.error;
                        if (this.currentLanguage === 'ar') {
                            errorMsg = 'خطأ في القراءة: ' + event.error;
                        }
                        this.showError(errorMsg);
                    };
                    
                    // Démarrer la lecture
                    console.log('🚀 Démarrage de la synthèse vocale...');
                    this.speechSynthesis.speak(this.currentUtterance);
                    
                } catch (error) {
                    console.error('❌ Erreur création utterance:', error);
                    button.textContent = '🔊';
                    button.classList.remove('playing');
                    this.showError(this.currentLanguage === 'ar' ? 
                        'خطأ في إعداد الصوت' : 'Erreur préparation audio');
                }
            }
            
            cleanTextForSpeech(text) {
                return text
                    .replace(/<[^>]*>/g, ' ')
                    .replace(/&[^;]+;/g, ' ')
                    .replace(/[📋🏥💬•🎙️🎯⚡🔊🎵💊🔬💼]/g, ' ')
                    .replace(/['"\\]/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
            }
            
            previewVoice() {
                const previewTexts = {
                    fr: "Bonjour ! Voici un aperçu de ma voix avec les paramètres actuels. Je peux vous aider avec vos questions d'assurance-maladie et calculer vos cotisations.",
                    ar: "مرحباً! هذه معاينة لصوتي مع الإعدادات الحالية. يمكنني مساعدتك في أسئلة التأمين الصحي وحساب اشتراكاتك."
                };
                
                const tempButton = document.createElement('button');
                tempButton.textContent = '🔊';
                tempButton.className = 'btn-voice-play';
                
                this.speakText(tempButton, previewTexts[this.currentLanguage]);
            }
            
            speakMessage(messageId) {
                const messageData = window.messageContents[messageId];
                if (!messageData) {
                    this.showError(this.currentLanguage === 'ar' ? 
                        'الرسالة غير موجودة' : 'Message introuvable');
                    return;
                }
                
                const button = document.querySelector(`button[onclick*="${messageId}"]`);
                if (!button) return;
                
                // Utiliser la langue du message stockée
                const messageLanguage = messageData.language || this.currentLanguage;
                const textToRead = messageData.text || messageData;
                
                this.speakText(button, textToRead, messageLanguage);
            }
            
            updateVoiceStatus(message) {
                if (this.voiceStatus) {
                    this.voiceStatus.textContent = message;
                }
                console.log('Voice Status:', message);
            }
            
            toggleRecording() {
                if (!this.recognition) {
                    this.showError(this.currentLanguage === 'ar' ? 
                        'التعرف على الصوت غير متاح' : 'Reconnaissance vocale non disponible');
                    return;
                }
                
                if (!this.isRecording) {
                    try {
                        this.recognition.start();
                    } catch (error) {
                        this.showError(this.currentLanguage === 'ar' ? 
                            'لا يمكن بدء التعرف على الصوت' : 'Impossible de démarrer la reconnaissance vocale');
                    }
                } else {
                    this.stopRecording();
                }
            }
            
            stopRecording() {
                if (this.recognition && this.isRecording) {
                    this.recognition.stop();
                }
                
                this.isRecording = false;
                this.voiceBtn.classList.remove('recording');
                this.voiceBtn.textContent = '🎤';
                
                const listeningText1 = this.currentLanguage === 'ar' ? 'أستمع' : 'Je vous écoute';
                const listeningText2 = this.currentLanguage === 'ar' ? 'أستمع إليك' : 'Je vous écoute';
                
                if (this.status.textContent.includes(listeningText1) || 
                    this.status.textContent.includes(listeningText2)) {
                    this.updateStatus('');
                }
            }
            
            async sendMessage() {
                const message = this.textInput.value.trim();
                if (!message) return;
                
                this.addMessage(message, 'user');
                this.textInput.value = '';
                this.updateStatus('');
                this.showLoading(true);
                
                try {
                    const response = await fetch('/ask', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ question: message })
                    });
                    
                    const result = await response.json();
                    
                    if (result.error) {
                        this.showError(result.error);
                    } else {
                        this.addMessage(result.answer, 'assistant', result.sources, result.language);
                    }
                    
                } catch (error) {
                    this.showError(this.currentLanguage === 'ar' ? 
                        'خطأ في الاتصال بالخادم' : 'Erreur de connexion au serveur');
                } finally {
                    this.showLoading(false);
                }
            }
            
            addMessage(content, type, sources = null, messageLanguage = null) {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${type}`;
                
                // Ajouter la classe arabe si le message est en arabe
                const isArabicMessage = messageLanguage === 'ar' || this.currentLanguage === 'ar' || this.detectArabicContent(content);
                if (isArabicMessage) {
                    messageDiv.classList.add('arabic');
                }
                
                // NOUVEAU: Formater le contenu pour un meilleur affichage
                const formattedContent = this.formatMessageContent(content, isArabicMessage);
                
                let sourcesHtml = '';
                if (sources && sources.length > 0) {
                    const sourcesTitle = isArabicMessage ? 
                        '📚 المصادر - القانون عدد 71 لسنة 2004:' : 
                        '📚 Sources - Loi n° 2004-71:';
                    
                    sourcesHtml = `<div class="sources ${isArabicMessage ? 'arabic-text' : ''}"><strong>${sourcesTitle}</strong>`;
                    sources.forEach(source => {
                        const articleLabel = isArabicMessage ? 'رقم المادة:' : 'Article ID:';
                        const typeLabel = isArabicMessage ? 'النوع:' : 'Type:';
                        
                        sourcesHtml += `<div class="source-item">
                            <strong>${articleLabel}</strong> ${source.article_id}<br>
                            <strong>${typeLabel}</strong> <span style="color: #22c55e;">${source.type}</span><br>
                            <small>${source.content}</small>
                        </div>`;
                    });
                    sourcesHtml += '</div>';
                }
                
                let voiceControlsHtml = '';
                if (type === 'assistant') {
                    const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    
                    voiceControlsHtml = `
                        <div class="message-header">
                            <div></div>
                            <div class="voice-controls">
                                <button class="btn-voice-play" onclick="window.voiceChat.speakMessage('${messageId}')" title="${isArabicMessage ? 'استمع' : 'Écouter'}">
                                    🔊
                                </button>
                            </div>
                        </div>
                    `;
                    
                    if (!window.messageContents) {
                        window.messageContents = {};
                    }
                    // Stocker le message avec sa langue
                    window.messageContents[messageId] = {
                        text: content,
                        language: isArabicMessage ? 'ar' : 'fr'
                    };
                }
                
                const contentClass = isArabicMessage ? 'arabic-text' : '';
                
                messageDiv.innerHTML = `
                    <div class="message-content ${contentClass}">
                        ${voiceControlsHtml}
                        <div class="formatted-response">${formattedContent}</div>
                        ${sourcesHtml}
                    </div>
                `;
                
                this.chatMessages.appendChild(messageDiv);
                this.scrollToBottom();
            }
            
            // NOUVELLE fonction pour formater le contenu des messages
            formatMessageContent(content, isArabic = false) {
                if (!content) return content;
                
                let formatted = content;
                
                // 1. Remplacer les titres avec ** par des spans stylés
                formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<span class="message-title">$1</span>');
                
                // 2. Traiter les listes avec •
                formatted = formatted.replace(/^• (.+)$/gm, '<div class="message-list-item">• $1</div>');
                
                // 3. Traiter les sections avec emojis comme titres
                formatted = formatted.replace(/^([🏥💊🔬📋💼🎙️⚖️💰🦷][^:]*:?)$/gm, '<div class="message-section-title">$1</div>');
                
                // 4. Remplacer les doubles retours à la ligne par des séparations de paragraphe
                formatted = formatted.replace(/\n\n+/g, '</div><div class="message-paragraph">');
                
                // 5. Remplacer les simples retours à la ligne par des <br>
                formatted = formatted.replace(/\n/g, '<br>');
                
                // 6. Encapsuler dans des paragraphes si pas déjà fait
                if (!formatted.includes('<div class="message-paragraph">')) {
                    formatted = `<div class="message-paragraph">${formatted}</div>`;
                } else {
                    formatted = `<div class="message-paragraph">${formatted}</div>`;
                }
                
                // 7. Nettoyer les div vides
                formatted = formatted.replace(/<div class="message-paragraph">\s*<\/div>/g, '');
                
                // 8. Traitement spécial pour les calculs de cotisations
                if (formatted.includes('CALCUL DE COTISATION') || formatted.includes('حساب الاشتراك')) {
                    formatted = formatted.replace(/• (.+?):/g, '<div class="calculation-line"><strong>$1:</strong>');
                    formatted = formatted.replace(/• \*\*(.+?)\*\*/g, '<div class="calculation-total"><strong>$1</strong></div>');
                }
                
                return formatted;
            }
            
            detectArabicContent(text) {
                const arabicChars = text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g);
                return arabicChars && arabicChars.length > text.length * 0.3;
            }
            
            showError(error) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error';
                const errorPrefix = this.currentLanguage === 'ar' ? '❌ خطأ:' : '❌ Erreur:';
                errorDiv.textContent = `${errorPrefix} ${error}`;
                this.chatMessages.appendChild(errorDiv);
                this.scrollToBottom();
            }
            
            showLoading(show) {
                this.loading.classList.toggle('show', show);
                this.sendBtn.disabled = show;
                this.voiceBtn.disabled = show;
            }
            
            updateStatus(message) {
                this.status.textContent = message;
            }
            
            scrollToBottom() {
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }
            
            saveVoiceSettings() {
                try {
                    const settings = {
                        voiceName: this.voiceSettings.voice ? this.voiceSettings.voice.name : null,
                        rate: this.voiceSettings.rate,
                        pitch: this.voiceSettings.pitch,
                        volume: this.voiceSettings.volume
                    };
                    localStorage.setItem('voiceSettings', JSON.stringify(settings));
                } catch (error) {
                    console.log('Impossible de sauvegarder les paramètres vocaux');
                }
            }
            
            loadVoiceSettings() {
                try {
                    const saved = localStorage.getItem('voiceSettings');
                    if (saved) {
                        const settings = JSON.parse(saved);
                        
                        this.voiceSettings.rate = settings.rate || 0.9;
                        this.voiceSettings.pitch = settings.pitch || 1.0;
                        this.voiceSettings.volume = settings.volume || 1.0;
                        
                        this.rateSlider.value = this.voiceSettings.rate;
                        this.pitchSlider.value = this.voiceSettings.pitch;
                        this.volumeSlider.value = this.voiceSettings.volume;
                        
                        this.rateValue.textContent = this.voiceSettings.rate;
                        this.pitchValue.textContent = this.voiceSettings.pitch;
                        this.volumeValue.textContent = this.voiceSettings.volume;
                        
                        this.savedVoiceName = settings.voiceName;
                    }
                } catch (error) {
                    console.log('Impossible de charger les paramètres vocaux');
                }
            }
            
            saveLanguageSettings() {
                try {
                    localStorage.setItem('currentLanguage', this.currentLanguage);
                } catch (error) {
                    console.log('Impossible de sauvegarder la langue');
                }
            }
            
            loadLanguageSettings() {
                try {
                    const saved = localStorage.getItem('currentLanguage');
                    if (saved && (saved === 'fr' || saved === 'ar')) {
                        this.currentLanguage = saved;
                        this.updateUI();
                    }
                } catch (error) {
                    console.log('Impossible de charger la langue');
                }
            }
        }

        // ===== FONCTIONS POUR LES TARIFS =====

        // Fonction pour afficher les tarifs
        function showTariffs(category) {
            const tariffDisplay = document.getElementById('tariffDisplay');
            const tariffGrid = document.getElementById('tariffGrid');
            const currentLang = window.voiceChat ? window.voiceChat.currentLanguage : 'fr';
            
            const data = TARIFFS_DATA[category];
            if (!data) return;
            
            const isArabic = currentLang === 'ar';
            const items = isArabic ? data.itemsAr : data.items;
            const title = isArabic ? data.titleAr : data.title;
            
            tariffGrid.innerHTML = `
                <div class="tariff-card ${isArabic ? 'arabic-tariff' : ''}">
                    <h4>${title}</h4>
                    ${Object.entries(items).map(([name, info]) => `
                        <div class="tariff-item">
                            <div class="tariff-label">${name}</div>
                            <div class="tariff-value">
                                ${info.rate || ''} 
                                ${info.reimbursed ? `(${info.reimbursed})` : ''}
                            </div>
                        </div>
                        ${info.description ? `<div style="font-size: 0.85em; color: #16a34a; padding: 4px 0;">${info.description}</div>` : ''}
                    `).join('')}
                </div>
            `;
            
            tariffDisplay.style.display = 'block';
            tariffDisplay.scrollIntoView({ behavior: 'smooth' });
        }

        // Fonction pour calculer les cotisations
        function calculateContribution() {
            const salary = parseFloat(document.getElementById('salaryInput').value);
            const resultDiv = document.getElementById('calculationResult');
            const currentLang = window.voiceChat ? window.voiceChat.currentLanguage : 'fr';
            
            if (!salary || salary <= 0) {
                resultDiv.innerHTML = `<div style="color: #dc2626; font-size: 0.9em;">
                    ${currentLang === 'ar' ? 'يرجى إدخال راتب صحيح' : 'Veuillez saisir un salaire valide'}
                </div>`;
                return;
            }
            
            // Calculs basés sur la Loi n° 2004-71
            const maxSalary = 2400; // Plafond mensuel
            const referenceSalary = Math.min(salary, maxSalary);
            const totalRate = 6.75;
            const employerRate = 4.75;
            const employeeRate = 2.0;
            
            const totalContribution = (referenceSalary * totalRate / 100);
            const employerContribution = (referenceSalary * employerRate / 100);
            const employeeContribution = (referenceSalary * employeeRate / 100);
            
            if (currentLang === 'ar') {
                resultDiv.innerHTML = `
                    <div class="result-box arabic-tariff">
                        <h4>💼 نتيجة حساب الاشتراك</h4>
                        <div class="tariff-item">
                            <span class="tariff-label">الراتب المصرح:</span>
                            <span class="tariff-value">${salary.toFixed(2)} دينار</span>
                        </div>
                        <div class="tariff-item">
                            <span class="tariff-label">راتب المرجع:</span>
                            <span class="tariff-value">${referenceSalary.toFixed(2)} دينار</span>
                        </div>
                        <div class="tariff-item">
                            <span class="tariff-label">الاشتراك الإجمالي (6.75%):</span>
                            <span class="tariff-value">${totalContribution.toFixed(2)} دينار</span>
                        </div>
                        <div class="tariff-item">
                            <span class="tariff-label">حصة رب العمل (4.75%):</span>
                            <span class="tariff-value">${employerContribution.toFixed(2)} دينار</span>
                        </div>
                        <div class="tariff-item">
                            <span class="tariff-label">حصة الأجير (2%):</span>
                            <span class="tariff-value">${employeeContribution.toFixed(2)} دينار</span>
                        </div>
                        <div style="font-size: 0.85em; color: #16a34a; margin-top: 10px;">
                            المادة الخامسة عشرة من القانون عدد واحد وسبعين لسنة ألفين وأربعة
                        </div>
                    </div>
                `;
            } else {
                resultDiv.innerHTML = `
                    <div class="result-box">
                        <h4>💼 Résultat du calcul de cotisation</h4>
                        <div class="tariff-item">
                            <span class="tariff-label">Salaire déclaré :</span>
                            <span class="tariff-value">${salary.toFixed(2)} DT</span>
                        </div>
                        <div class="tariff-item">
                            <span class="tariff-label">Salaire de référence :</span>
                            <span class="tariff-value">${referenceSalary.toFixed(2)} DT</span>
                        </div>
                        <div class="tariff-item">
                            <span class="tariff-label">Cotisation totale (6,75%) :</span>
                            <span class="tariff-value">${totalContribution.toFixed(2)} DT</span>
                        </div>
                        <div class="tariff-item">
                            <span class="tariff-label">Part employeur (4,75%) :</span>
                            <span class="tariff-value">${employerContribution.toFixed(2)} DT</span>
                        </div>
                        <div class="tariff-item">
                            <span class="tariff-label">Part salarié (2%) :</span>
                            <span class="tariff-value">${employeeContribution.toFixed(2)} DT</span>
                        </div>
                        <div style="font-size: 0.85em; color: #16a34a; margin-top: 10px;">
                            Article 15 de la Loi n° 2004-71
                        </div>
                    </div>
                `;
            }
        }

        // Permettre la soumission par Entrée
        document.addEventListener('DOMContentLoaded', function() {
            const salaryInput = document.getElementById('salaryInput');
            if (salaryInput) {
                salaryInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        calculateContribution();
                    }
                });
            }
        });
        
        // Fonctions globales
        window.toggleVoiceSettings = function() {
            const settings = document.getElementById('voiceSettings');
            settings.classList.toggle('show');
        };
        
        window.toggleLanguage = function() {
            if (window.voiceChat) {
                window.voiceChat.toggleLanguage();
            }
        };
        
        window.previewVoice = function() {
            if (window.voiceChat) {
                window.voiceChat.previewVoice();
            }
        };
        
        window.speakText = function(button, text) {
            if (window.voiceChat) {
                window.voiceChat.speakText(button, text);
            }
        };
        
        window.speakMessage = function(messageId) {
            if (window.voiceChat) {
                window.voiceChat.speakMessage(messageId);
            }
        };

        window.showTariffs = showTariffs;
        window.calculateContribution = calculateContribution;
        
        // Initialisation avec protection d'erreur
        document.addEventListener('DOMContentLoaded', () => {
            try {
                window.voiceChat = new VoiceChat();
                console.log('VoiceChat initialisé avec succès');
            } catch (error) {
                console.error('Erreur lors de l\'initialisation de VoiceChat:', error);
                // Fallback simple
                document.getElementById('sendBtn').addEventListener('click', () => {
                    alert('Erreur: Veuillez recharger la page');
                });
            }
        });
  