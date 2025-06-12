from flask import Flask, render_template, request, jsonify
from flask import Flask, send_from_directory, request, jsonify
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.chains import RetrievalQA
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
import os
import re
# Ajoute cette ligne en haut de app.py juste après from flask import …
from flask_cors import CORS

FRONT_DIST = os.path.join(os.path.dirname(__file__), "../FrontendReact/dist")

app = Flask(__name__)
CORS(app, resources={r"/ask": {"origins": "*"}})   # ou limite au domaine de ton client
# Configuration Groq
GROQ_API_KEY = "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"

# ===== NOUVELLE CLASSE POUR GÉRER LES TARIFS =====
class TarifsRemboursement:
    """Classe pour gérer les tarifs de remboursement selon la Loi n° 2004-71"""
    
    def __init__(self):
        self.tarifs = {
            "consultations": {
                "medecin_generaliste": {
                    "tarif_conventionnel": 25.0,
                    "taux_remboursement": 70,
                    "montant_rembourse": 17.5,
                    "description": "Consultation médecin généraliste"
                },
                "medecin_specialiste": {
                    "tarif_conventionnel": 40.0,
                    "taux_remboursement": 70,
                    "montant_rembourse": 28.0,
                    "description": "Consultation médecin spécialiste"
                },
                "consultation_urgence": {
                    "tarif_conventionnel": 35.0,
                    "taux_remboursement": 70,
                    "montant_rembourse": 24.5,
                    "description": "Consultation en urgence"
                },
                "visite_domicile": {
                    "tarif_conventionnel": 50.0,
                    "taux_remboursement": 70,
                    "montant_rembourse": 35.0,
                    "description": "Visite à domicile"
                }
            },
            "pharmacie": {
                "medicaments_essentiels": {
                    "taux_remboursement": 85,
                    "description": "Liste A - Médicaments vitaux et essentiels",
                    "exemples": "Antibiotiques, insuline, médicaments cardiaques"
                },
                "medicaments_importants": {
                    "taux_remboursement": 70,
                    "description": "Liste B - Médicaments importants",
                    "exemples": "Anti-inflammatoires, antidouleurs"
                },
                "medicaments_complementaires": {
                    "taux_remboursement": 40,
                    "description": "Liste C - Médicaments complémentaires",
                    "exemples": "Vitamines, compléments alimentaires"
                },
                "generiques": {
                    "taux_remboursement": 85,
                    "description": "Médicaments génériques encouragés",
                    "avantage": "Même remboursement que les essentiels"
                }
            },
            "hospitalisation": {
                "secteur_public": {
                    "taux_remboursement": 90,
                    "description": "Hôpitaux publics conventionnés",
                    "franchise": "Ticket modérateur de 10%"
                },
                "secteur_prive": {
                    "taux_remboursement": 70,
                    "description": "Cliniques privées conventionnées",
                    "franchise": "Ticket modérateur de 30%"
                },
                "chirurgie": {
                    "taux_remboursement": 85,
                    "description": "Interventions chirurgicales",
                    "conditions": "Selon nomenclature officielle"
                }
            },
            "analyses_examens": {
                "biologie_medicale": {
                    "taux_remboursement": 70,
                    "description": "Analyses biologiques courantes",
                    "exemples": "Analyses sanguines, urinaires"
                },
                "imagerie_medicale": {
                    "taux_remboursement": 70,
                    "description": "Imagerie médicale",
                    "exemples": "Radiographie, échographie, scanner"
                },
                "examens_specialises": {
                    "taux_remboursement": 70,
                    "description": "Examens spécialisés",
                    "exemples": "ECG, EEG, endoscopie"
                }
            },
            "dentaire": {
                "soins_conservateurs": {
                    "taux_remboursement": 70,
                    "description": "Soins dentaires conservateurs",
                    "exemples": "Plombages, détartrages"
                },
                "protheses": {
                    "taux_remboursement": 50,
                    "description": "Prothèses dentaires",
                    "conditions": "Sur devis et accord préalable"
                }
            }
        }
        
        # Cotisations et plafonds selon Article 15
        self.cotisations = {
            "taux_cotisation_base": 6.75,  # % du salaire (Article 15)
            "repartition": {
                "employeur": 4.75,  # %
                "salarie": 2.0      # %
            },
            "plafond_mensuel": 2400.0,  # Dinars tunisiens
            "salaire_minimum": 400.0,   # SMIG
            "plafond_annuel": 28800.0   # 2400 x 12
        }
        
        # Franchises et tickets modérateurs
        self.franchises = {
            "consultation_base": 2.0,  # DT
            "medicaments": {
                "minimum": 1.0,
                "maximum": 10.0
            },
            "hospitalisation": {
                "public": "10% des frais",
                "prive": "30% des frais"
            }
        }

    def get_remboursement_info(self, categorie, sous_categorie=None):
        """Récupère les informations de remboursement"""
        if categorie in self.tarifs:
            if sous_categorie and sous_categorie in self.tarifs[categorie]:
                return self.tarifs[categorie][sous_categorie]
            return self.tarifs[categorie]
        return None

    def calculer_cotisation(self, salaire):
        """Calcule la cotisation mensuelle selon Article 15"""
        salaire_plafonné = min(salaire, self.cotisations["plafond_mensuel"])
        cotisation_totale = salaire_plafonné * (self.cotisations["taux_cotisation_base"] / 100)
        
        return {
            "salaire_declare": salaire,
            "salaire_de_reference": salaire_plafonné,
            "cotisation_totale": round(cotisation_totale, 2),
            "part_employeur": round(salaire_plafonné * (self.cotisations["repartition"]["employeur"] / 100), 2),
            "part_salarie": round(salaire_plafonné * (self.cotisations["repartition"]["salarie"] / 100), 2),
            "cotisation_annuelle": round(cotisation_totale * 12, 2)
        }

    def calculer_remboursement(self, categorie, sous_categorie, montant):
        """Calcule le remboursement pour un montant donné"""
        info = self.get_remboursement_info(categorie, sous_categorie)
        if not info or 'taux_remboursement' not in info:
            return None
            
        taux = info['taux_remboursement']
        montant_rembourse = montant * (taux / 100)
        ticket_moderateur = montant - montant_rembourse
        
        return {
            "montant_initial": montant,
            "taux_remboursement": taux,
            "montant_rembourse": round(montant_rembourse, 2),
            "ticket_moderateur": round(ticket_moderateur, 2),
            "description": info.get('description', '')
        }

# ===== FONCTIONS DE DÉTECTION ET GÉNÉRATION =====

def detect_tariff_question(query):
    """Détecte si la question concerne les tarifs de remboursement"""
    
    keywords_fr = [
        'tarif', 'remboursement', 'rembourse', 'cotisation', 'coût', 'prix',
        'combien', 'montant', 'pourcentage', 'taux', 'plafond', 'franchise',
        'ticket modérateur', 'consultation', 'médecin', 'médicament', 'hôpital',
        'dentiste', 'analyse', 'examen', 'payé', 'payée', 'salaire'
    ]
    
    keywords_ar = [
        'تعريفة', 'استرداد', 'اشتراك', 'مساهمة', 'كلفة', 'سعر', 'تكلفة',
        'كم', 'مبلغ', 'نسبة', 'معدل', 'سقف', 'امتياز', 'حصة',
        'استشارة', 'طبيب', 'دواء', 'مستشفى', 'طبيب أسنان',
        'تحليل', 'فحص', 'راتب', 'أجر'
    ]
    
    query_lower = query.lower()
    
    return (any(keyword in query_lower for keyword in keywords_fr) or
            any(keyword in query for keyword in keywords_ar))

def detect_cotisation_question(query):
    """Détecte spécifiquement les questions sur les cotisations"""
    cotisation_keywords = [
        'cotisation', 'salaire', 'employeur', 'salarié', 'calculer',
        'اشتراك', 'راتب', 'رب عمل', 'أجير', 'حساب'
    ]
    
    query_lower = query.lower()
    return any(keyword in query_lower or keyword in query for keyword in cotisation_keywords)

def extract_salary_from_query(query):
    """Extrait le montant du salaire d'une question"""
    import re
    numbers = re.findall(r'\d+(?:\.\d+)?', query)
    return float(numbers[0]) if numbers else None

def generate_tariff_response(query, language='fr'):
    """Génère une réponse spécialisée pour les tarifs"""
    
    tarifs = TarifsRemboursement()
    
    # Vérifier si c'est une question sur les cotisations
    if detect_cotisation_question(query):
        salary = extract_salary_from_query(query)
        if salary:
            calcul = tarifs.calculer_cotisation(salary)
            if language == 'fr':
                return f"""**💼 CALCUL DE COTISATION - ARTICLE 15**

**Salaire déclaré :** {calcul['salaire_declare']} DT
**Salaire de référence :** {calcul['salaire_de_reference']} DT (plafonné à 2 400 DT)

**Répartition des cotisations (6,75% total) :**
• Part employeur : {calcul['part_employeur']} DT (4,75%)
• Part salarié : {calcul['part_salarie']} DT (2%)
• **Total mensuel : {calcul['cotisation_totale']} DT**
• **Total annuel : {calcul['cotisation_annuelle']} DT**

*Base légale : Article 15 de la Loi n° 2004-71*"""
            else:
                return f"""**💼 حساب الاشتراك - المادة الخامسة عشرة**

**الراتب المصرح به :** {calcul['salaire_declare']} دينار
**راتب المرجع :** {calcul['salaire_de_reference']} دينار (محدود بألفين وأربعمائة دينار)

**توزيع الاشتراكات (ستة فاصل خمسة وسبعون بالمائة إجمالي) :**
• حصة رب العمل : {calcul['part_employeur']} دينار (أربعة فاصل خمسة وسبعون بالمائة)
• حصة الأجير : {calcul['part_salarie']} دينار (اثنان بالمائة)
• **المجموع الشهري : {calcul['cotisation_totale']} دينار**
• **المجموع السنوي : {calcul['cotisation_annuelle']} دينار**

*الأساس القانوني : المادة الخامسة عشرة من القانون عدد واحد وسبعين لسنة ألفين وأربعة*"""
    
    # Réponse générale sur les tarifs
    if language == 'fr':
        response = """**💰 TARIFS DE REMBOURSEMENT - LOI N° 2004-71**

**📋 CONSULTATIONS MÉDICALES**
• Médecin généraliste : 70% de  35–45 DT DT
• Médecin spécialiste : 70% de  50–70 DT DT
• Consultation urgence : 70%
• Visite à domicile : 70% 

**💊 MÉDICAMENTS (selon listes officielles)**
• Liste A (essentiels) : **85% de remboursement**
• Liste B (importants) : **70% de remboursement**
• Liste C (complémentaires) : **40% de remboursement**
• Médicaments génériques : **85% de remboursement**

**🏥 HOSPITALISATION**
• Secteur public : **90% des frais** (ticket modérateur 10%)
• Secteur privé conventionné : **70% des frais** (ticket modérateur 30%)
• Chirurgie : **85% selon nomenclature**

**🔬 ANALYSES ET EXAMENS**
• Biologie médicale : **70% du tarif conventionnel**
• Imagerie médicale : **70% du tarif conventionnel**
• Examens spécialisés : **70% du tarif conventionnel**

**🦷 SOINS DENTAIRES**
• Soins conservateurs : **70% de remboursement**
• Prothèses dentaires : **50% sur accord préalable**

**💼 COTISATIONS (Article 15)**
• Taux total : **6,75% du salaire**
• Part employeur : **4,75%** | Part salarié : **2%**
• Plafond mensuel : **2 400 DT** | Plafond annuel : **28 800 DT**

**⚖️ BASE LÉGALE**
Articles 14, 15, 26 et 27 de la Loi n° 2004-71"""
        
    else:  # Arabic
        response = """**💰 تعريفات الاسترداد - القانون عدد واحد وسبعين لسنة ألفين وأربعة**

**📋 الاستشارات الطبية**
• طبيب عام : سبعون بالمائة من خمسة وعشرين ديناراً = **سبعة عشر ديناراً ونصف**
• طبيب مختص : سبعون بالمائة من أربعين ديناراً = **ثمانية وعشرون ديناراً**
• استشارة طارئة : سبعون بالمائة من خمسة وثلاثين ديناراً = **أربعة وعشرون ديناراً ونصف**
• زيارة منزلية : سبعون بالمائة من خمسين ديناراً = **خمسة وثلاثون ديناراً**

**💊 الأدوية (حسب القوائم الرسمية)**
• القائمة الأولى (أساسية) : **خمسة وثمانون بالمائة**
• القائمة الثانية (مهمة) : **سبعون بالمائة**
• القائمة الثالثة (تكميلية) : **أربعون بالمائة**
• الأدوية الجنيسة : **خمسة وثمانون بالمائة**

**🏥 الاستشفاء**
• القطاع العام : **تسعون بالمائة من المصاريف** (حصة عشرة بالمائة)
• القطاع الخاص المتعاقد : **سبعون بالمائة من المصاريف** (حصة ثلاثون بالمائة)
• الجراحة : **خمسة وثمانون بالمائة حسب التسعيرة**

**🔬 التحاليل والفحوصات**
• البيولوجيا الطبية : **سبعون بالمائة من التعريفة التعاقدية**
• التصوير الطبي : **سبعون بالمائة من التعريفة التعاقدية**
• الفحوصات المتخصصة : **سبعون بالمائة من التعريفة التعاقدية**

**🦷 العناية بالأسنان**
• العلاجات التحفظية : **سبعون بالمائة**
• الأطراف الاصطناعية : **خمسون بالمائة بموافقة مسبقة**

**💼 الاشتراكات (المادة الخامسة عشرة)**
• المعدل الإجمالي : **ستة فاصل خمسة وسبعون بالمائة من الراتب**
• حصة رب العمل : **أربعة فاصل خمسة وسبعون بالمائة** | حصة الأجير : **اثنان بالمائة**
• السقف الشهري : **ألفان وأربعمائة دينار** | السقف السنوي : **ثمانية وعشرون ألفاً وثمانمائة دينار**

**⚖️ الأساس القانوني**
المواد الرابعة عشرة والخامسة عشرة والسادسة والعشرون والسابعة والعشرون من القانون عدد واحد وسبعين لسنة ألفين وأربعة"""
    
    return response.strip()

# ===== FONCTIONS EXISTANTES (SANS MODIFICATION) =====

def detect_language(text):
    """Détecte si le texte est en arabe ou en français"""
    if not text:
        return 'fr'
    
    # Compter les caractères arabes
    arabic_chars = re.findall(r'[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]', text)
    arabic_ratio = len(arabic_chars) / len(text) if text else 0
    
    # Si plus de 20% de caractères arabes, c'est de l'arabe
    if arabic_ratio > 0.2:
        return 'ar'
    
    # Mots-clés arabes courants
    arabic_keywords = [
        'أهلا', 'مرحبا', 'مرحباً', 'السلام', 'صباح', 'مساء',
        'ما', 'هو', 'هي', 'كيف', 'متى', 'أين', 'من', 'لماذا', 'هل',
        'التأمين', 'الصحي', 'الصحة', 'القانون', 'المرض', 'الضمان',
        'الصندوق', 'الوطني', 'شروط', 'انتساب', 'استرداد', 'حقوق'
    ]
    
    # Mots-clés français courants
    french_keywords = [
        'bonjour', 'salut', 'bonsoir',
        'quoi', 'comment', 'quand', 'où', 'qui', 'pourquoi',
        'assurance', 'maladie', 'santé', 'loi', 'cnam',
        'conditions', 'affiliation', 'remboursement', 'droits'
    ]
    
    text_lower = text.lower()
    
    # Compter les correspondances
    arabic_matches = sum(1 for keyword in arabic_keywords if keyword in text)
    french_matches = sum(1 for keyword in french_keywords if keyword in text_lower)
    
    # Décision basée sur les mots-clés
    if arabic_matches > 0:
        return 'ar'
    elif french_matches > 0:
        return 'fr'
    
    # Par défaut, retourner français
    return 'fr'

# Prompt spécialisé pour le français
FRENCH_PROMPT = """
Tu es un agent expert spécialisé en Loi n° 2004-71 du 2 août 2004, portant institution d'un régime d'assurance-maladie en Tunisie.

RÔLE ET EXPERTISE :
- Expert juridique en assurance-maladie tunisienne
- Spécialiste de la Loi n° 2004-71 et ses applications
- Conseiller en droits et obligations des assurés sociaux
- Guide pour les procédures administratives de la CNAM

DOMAINES DE COMPÉTENCE :
✅ Régime d'assurance-maladie obligatoire
✅ Prestations couvertes et non couvertes
✅ Conditions d'affiliation et de bénéfice
✅ Procédures de remboursement
✅ Droits des assurés et ayants droit
✅ Obligations des employeurs et salariés
✅ Sanctions et contentieux
✅ Relations avec la CNAM (Caisse Nationale d'Assurance Maladie)

INSTRUCTIONS DE RÉPONSE :
1. Toujours citer les articles spécifiques de la Loi n° 2004-71 quand applicable
2. Donner des réponses précises, pratiques et actionables
3. Expliquer les procédures étape par étape
4. Mentionner les délais légaux et administratifs
5. Indiquer les documents requis pour chaque démarche
6. Signaler les droits de recours en cas de litige

CONTEXTE LÉGAL :
Loi n° 2004-71 du 2 août 2004, portant institution d'un régime d'assurance-maladie en République Tunisienne, et tous ses décrets d'application.

QUESTION : {question}

DOCUMENTS DE RÉFÉRENCE :
{context}

RÉPONSE EXPERTE :
Basée sur la Loi n° 2004-71 et les documents juridiques fournis, voici ma réponse détaillée :
"""

# Prompt arabe ULTRA RENFORCÉ
ARABIC_PROMPT = """
أنت خبير قانوني تونسي متخصص في قانون التأمين على المرض.

تحذير مهم جداً:
- يجب أن تكتب كل كلمة باللغة العربية فقط
- ممنوع منعاً باتاً استخدام أي حرف إنجليزي أو فرنسي
- ممنوع كتابة أي رقم بالأرقام اللاتينية
- ممنوع استخدام أي مصطلح أجنبي مثل: cotisations, transfert, revenues, valuations, etc.
- إذا لم تعرف الترجمة العربية لمصطلح، استخدم وصفاً عربياً بديلاً

مثال على الإجابة المطلوبة:
"بموجب المادة الثامنة من القانون عدد واحد وسبعين لسنة ألفين وأربعة، يشمل نظام التأمين على المرض الإجباري جميع المواطنين التونسيين. ويتضمن تمويل هذا النظام الاقتطاعات المحددة قانونياً والغرامات المفروضة عند التأخير في الدفع وعائدات الاستثمارات والهبات والتبرعات."

السؤال: {question}

الوثائق المرجعية:
{context}

الإجابة (بالعربية الخالصة فقط):
"""

def aggressive_arabic_cleanup(text):
    """تنظيف شامل وقوي للنص العربي"""
    if not text:
        return text
    
    # إزالة الجمل التي تحتوي على كلمات أجنبية
    lines = text.split('\n')
    clean_lines = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # إزالة الأسطر التي تحتوي على كلمات إنجليزية/فرنسية
        if re.search(r'\b[a-zA-Z]{3,}\b', line):
            # إذا كان السطر يحتوي على كلمات أجنبية، تخطيه
            continue
            
        # إزالة الرموز النقطية المختلطة
        if line.startswith('*') and re.search(r'[a-zA-Z]', line):
            continue
            
        clean_lines.append(line)
    
    cleaned_text = '\n'.join(clean_lines)
    
    # إزالة الكلمات الأجنبية المحددة
    foreign_words = [
        r'\bcotisations?\b', r'\btransfer[t]?\b', r'\brevenues?\b', r'\bvaluations?\b',
        r'\bfor\b', r'\bof\b', r'\bthe\b', r'\band\b', r'\bwithin\b', r'\bnon-payment\b',
        r'\bpremiums?\b', r'\bdeadlines?\b', r'\bpenalties?\b', r'\bmissions?\b',
        r'\bprévues?\b', r'\bpar\b', r'\bla\b', r'\bprésente\b', r'\bloi\b',
        r'\bdues?\b', r'\baux\b', r'\btitres?\b', r'\bdes\b', r'\brégimes?\b',
        r'\bet\b', r'\bprestations?\b', r'\bà\b', r'\barticle\b',
        r'\bcaisse\b', r'\bselon\b', r'\bles\b', r'\bmodalités\b', r'\bprocédures?\b',
        r'\bqui\b', r'\bsont\b', r'\bfixées?\b', r'\bune\b', r'\bconvention\b',
        r'\bconclue\b', r'\bentre\b', r'\bcaisses?\b', r'\bconcernées?\b'
    ]
    
    for word in foreign_words:
        cleaned_text = re.sub(word, '', cleaned_text, flags=re.IGNORECASE)
    
    # إزالة الأحرف غير العربية والأرقام اللاتينية والعلامات الغريبة
    cleaned_text = re.sub(r'[a-zA-Z0-9]', '', cleaned_text)
    
    # إزالة الأحرف اليونانية والسيريلية
    cleaned_text = re.sub(r'[\u0370-\u03FF\u0400-\u04FF]', '', cleaned_text)
    
    # تنظيف العلامات النقطية المكسورة
    cleaned_text = re.sub(r'\*\s*$', '', cleaned_text, flags=re.MULTILINE)
    
    # تنظيف المسافات المتعددة
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text)
    cleaned_text = re.sub(r'\n\s*\n', '\n\n', cleaned_text)
    
    return cleaned_text.strip()

def translate_key_terms_to_arabic(text):
    """ترجمة المصطلحات الأساسية إلى العربية"""
    translations = {
        'cotisations': 'الاشتراكات',
        'transfert': 'التحويل',
        'revenues': 'الإيرادات',
        'valuations': 'التقييمات',
        'premiums': 'الأقساط',
        'penalties': 'الغرامات',
        'deadlines': 'المواعيد النهائية',
        'missions': 'المهام',
        'caisse': 'الصندوق',
        'convention': 'الاتفاقية',
        'modalités': 'الطرق',
        'procédures': 'الإجراءات'
    }
    
    for foreign, arabic in translations.items():
        text = re.sub(foreign, arabic, text, flags=re.IGNORECASE)
    
    return text

def generate_pure_arabic_response(query, context_docs):
    """توليد إجابة عربية خالصة"""
    
    # استخراج المعلومات من الوثائق
    relevant_info = []
    for doc in context_docs[:3]:  # أخذ أول 3 وثائق فقط
        content = doc.page_content
        # تنظيف المحتوى من اللغات الأجنبية
        clean_content = aggressive_arabic_cleanup(content)
        if clean_content and len(clean_content) > 50:
            relevant_info.append(clean_content[:200])
    
    # إنشاء إجابة مباشرة باللغة العربية
    if 'نظام التأمين' in query or 'الإجباري' in query:
        response = f"""
بموجب القانون عدد واحد وسبعين لسنة ألفين وأربعة المؤرخ في الثاني من شهر أوت، يُعرَّف نظام التأمين على المرض الإجباري بأنه النظام الذي يشمل جميع المواطنين التونسيين لضمان تغطيتهم الصحية.

أهداف النظام:
• توفير الحماية الصحية لجميع المواطنين
• ضمان الحصول على الخدمات الطبية اللازمة
• تنظيم عملية استرداد المصاريف الطبية

شروط الانتساب:
• الجنسية التونسية
• دفع الاشتراكات المحددة قانونياً
• التسجيل لدى الصندوق الوطني للتأمين على المرض

مصادر التمويل:
• الاشتراكات الشهرية من المؤمن لهم
• مساهمات أرباب العمل
• الغرامات المالية عند التأخير في الدفع
• عائدات استثمار أموال الصندوق
• الهبات والتبرعات المخصصة للنظام
"""
    elif 'الصندوق الوطني' in query or 'CNAM' in query:
        response = f"""
الصندوق الوطني للتأمين على المرض هو المؤسسة العمومية المكلفة بتطبيق أحكام القانون عدد واحد وسبعين لسنة ألفين وأربعة.

مهام الصندوق الأساسية:
• إدارة نظام التأمين على المرض الإجباري
• تحصيل الاشتراكات من المؤمن لهم
• صرف التعويضات والمنافع المقررة قانونياً
• مراقبة تطبيق أحكام القانون
• إبرام الاتفاقيات مع مقدمي الخدمات الصحية

الخدمات المقدمة:
• استرداد المصاريف الطبية
• تغطية نفقات الأدوية المرخصة
• تمويل العمليات الجراحية الضرورية
• دعم علاج الأمراض المزمنة
"""
    else:
        # إجابة عامة
        response = f"""
بموجب القانون عدد واحد وسبعين لسنة ألفين وأربعة المتعلق بإحداث نظام التأمين على المرض، تم تأسيس منظومة شاملة للحماية الصحية في تونس.

هذا القانون ينظم:
• حقوق وواجبات المؤمن لهم
• طرق تمويل النظام
• آليات تقديم الخدمات الصحية
• إجراءات الاسترداد والتعويض
• نظام العقوبات والطعون

للحصول على معلومات دقيقة أكثر، يُرجى تحديد موضوع استفسارك بشكل أوضح.
"""
    
    return response.strip()

# Initialisation des modèles
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
store = FAISS.load_local("stores/loi", embedding_model, allow_dangerous_deserialization=True)

# Configuration du LLM avec paramètres différents selon la langue
llm_french = ChatGroq(
    temperature=0.1,
    top_p=0.8,
    model_name="llama3-8b-8192",
    api_key=GROQ_API_KEY   
)

# LLM pour l'arabe avec température encore plus basse
llm_arabic = ChatGroq(
    temperature=0.001,  # Température quasi-nulle
    top_p=0.3,          # Très restrictif
    model_name="llama3-8b-8192",
    api_key=GROQ_API_KEY   
)

# Création des prompt templates
french_prompt_template = PromptTemplate(
    template=FRENCH_PROMPT,
    input_variables=["question", "context"]
)

arabic_prompt_template = PromptTemplate(
    template=ARABIC_PROMPT,
    input_variables=["question", "context"]
)

# QA Chains pour les deux langues
french_qa_chain = RetrievalQA.from_chain_type(
    llm=llm_french,
    retriever=store.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=True,
    chain_type_kwargs={"prompt": french_prompt_template}
)

arabic_qa_chain = RetrievalQA.from_chain_type(
    llm=llm_arabic,
    retriever=store.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=True,
    chain_type_kwargs={"prompt": arabic_prompt_template}
)

# ---------------- ROUTES REACT ---------------- #
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    file_path = os.path.join(FRONT_DIST, path)
    if os.path.isfile(file_path):            # /assets/**, favicon, etc.
        return send_from_directory(FRONT_DIST, path)
    # sinon → index.html (mode SPA)
    return send_from_directory(FRONT_DIST, "index.html")

@app.route('/ask', methods=['POST'])
def ask_question():
    try:
        query = request.json.get('question', '')
        if not query:
            return jsonify({'error': 'Question vide'}), 400
        
        # Détection de la langue
        detected_language = detect_language(query)
        print(f"Langue détectée: {detected_language} pour la question: {query}")
        
        # ===== NOUVEAU: TRAITEMENT SPÉCIALISÉ POUR LES TARIFS =====
        if detect_tariff_question(query):
            print(f"Question sur les tarifs détectée: {query}")
            
            tariff_response = generate_tariff_response(query, detected_language)
            
            # Créer des sources pour les tarifs
            sources = [{
                'article_id': 'Articles 14, 15, 26, 27',
                'content': 'Tarifs et remboursements selon la Loi n° 2004-71 - Cotisations et prestations',
                'type': 'Loi n° 2004-71 - Assurance-maladie (Tarifs officiels)'
            }]
            
            return jsonify({
                'answer': tariff_response,
                'sources': sources,
                'language': detected_language,
                'tariff_response': True  # Indicateur pour le frontend
            })
        
        # Messages de salutation selon la langue
        if detected_language == 'ar':
            greeting_keywords = [
                'مرحبا', 'مرحباً', 'أهلا', 'أهلاً', 'السلام عليكم', 'صباح الخير', 'مساء الخير',
                'كيف الحال', 'كيف حالك', 'شكرا', 'شكراً', 'مع السلامة',
                'إلى اللقاء', 'وداعا', 'وداعاً'
            ]
            
            greeting_responses = {
                'مرحبا': 'مرحباً! أنا خبيرك في القانون عدد واحد وسبعين لسنة ألفين وأربعة للتأمين على المرض. كيف يمكنني مساعدتك؟',
                'مرحباً': 'مرحباً! أنا خبيرك في القانون عدد واحد وسبعين لسنة ألفين وأربعة للتأمين على المرض. كيف يمكنني مساعدتك؟',
                'أهلا': 'أهلاً وسهلاً! متخصص في التأمين الصحي التونسي، أجيب على أسئلتك حول القانون عدد واحد وسبعين لسنة ألفين وأربعة.',
                'أهلاً': 'أهلاً وسهلاً! متخصص في التأمين الصحي التونسي، أجيب على أسئلتك حول القانون عدد واحد وسبعين لسنة ألفين وأربعة.',
                'السلام عليكم': 'وعليكم السلام ورحمة الله! خبير في التأمين على المرض، اطرح أسئلتك حول الصندوق الوطني.',
                'صباح الخير': 'صباح النور! كيف يمكنني مساعدتك في موضوع التأمين الصحي اليوم؟',
                'مساء الخير': 'مساء النور! جاهز للإجابة على استفساراتك حول القانون عدد واحد وسبعين لسنة ألفين وأربعة.',
                'شكرا': 'العفو! لا تتردد في طرح أي سؤال حول التأمين على المرض والصندوق الوطني.',
                'شكراً': 'العفو! لا تتردد في طرح أي سؤال حول التأمين على المرض والصندوق الوطني.',
                'مع السلامة': 'مع السلامة! عد متى شئت للاستفسار عن التأمين الصحي.',
                'كيف الحال': 'الحمد لله! جاهز لمساعدتك في أمور التأمين على المرض. ما سؤالك؟'
            }
            
            default_greeting = "مرحباً! أنا خبيرك في القانون عدد واحد وسبعين لسنة ألفين وأربعة المتعلق بإحداث نظام التأمين على المرض. اطرح أسئلتك!"
            
        else:
            greeting_keywords = [
                'bonjour', 'bonsoir', 'salut', 'hello', 'hi', 'hey',
                'comment allez-vous', 'comment ça va', 'ça va',
                'merci', 'merci beaucoup', 'au revoir', 'à bientôt',
                'comment tu vas', 'comment vous allez',
                'bonne journée', 'bonne soirée', 'bonne nuit'
            ]
            
            greeting_responses = {
                'bonjour': 'Bonjour ! Je suis votre expert en Loi n° 2004-71 sur l\'assurance-maladie. Comment puis-je vous aider ?',
                'bonsoir': 'Bonsoir ! Spécialiste de la Loi n° 2004-71, je suis là pour vos questions d\'assurance-maladie.',
                'salut': 'Salut ! Expert en assurance-maladie tunisienne, posez-moi vos questions sur la Loi n° 2004-71.',
                'merci': 'De rien ! N\'hésitez pas pour toute question sur l\'assurance-maladie et la CNAM.',
                'au revoir': 'Au revoir ! Revenez quand vous voulez pour l\'assurance-maladie.',
                'comment ça va': 'Ça va bien ! Prêt à vous conseiller sur la Loi n° 2004-71 d\'assurance-maladie.',
                'comment allez-vous': 'Très bien ! Comment puis-je vous aider avec l\'assurance-maladie aujourd\'hui ?'
            }
            
            default_greeting = "Bonjour ! Je suis votre expert en Loi n° 2004-71 portant institution d'un régime d'assurance-maladie. Posez-moi vos questions !"
        
        # Vérifier si c'est juste une salutation
        query_lower = query.lower().strip()
        is_greeting = any(keyword in query_lower for keyword in greeting_keywords)
        
        # Si c'est une salutation courte sans question juridique
        if is_greeting and len(query) < 25 and '?' not in query:
            response_text = default_greeting
            for keyword, response in greeting_responses.items():
                if keyword in query_lower:
                    response_text = response
                    break
            
            return jsonify({
                'answer': response_text,
                'sources': [],
                'language': detected_language
            })
        
        # Pour les vraies questions juridiques
        if detected_language == 'ar':
            print(f"استخدام الطريقة الجديدة للإجابة العربية: {query}")
            
            # البحث في الوثائق
            docs = store.similarity_search(query, k=5)
            
            # إنشاء إجابة عربية خالصة مباشرة
            answer = generate_pure_arabic_response(query, docs)
            
            # إعداد المصادر
            sources = []
            for doc in docs:
                sources.append({
                    'article_id': doc.metadata.get('article_id', 'غير معروف'),
                    'content': doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                    'type': 'القانون عدد واحد وسبعين لسنة ألفين وأربعة - التأمين على المرض'
                })
            
            return jsonify({
                'answer': answer,
                'sources': sources,
                'language': detected_language
            })
            
        else:
            print(f"Utilisation du prompt français pour: {query}")
            result = french_qa_chain({"query": query})
            answer = result["result"]
            
            # Préparer les sources
            sources = []
            for doc in result["source_documents"]:
                sources.append({
                    'article_id': doc.metadata.get('article_id', 'inconnu'),
                    'content': doc.page_content[:300] + "..." if len(doc.page_content) > 300 else doc.page_content,
                    'type': 'Loi n° 2004-71 - Assurance-maladie'
                })
        
        return jsonify({
            'answer': answer,
            'sources': sources,
            'language': detected_language
        })
    
    except Exception as e:
        error_message = 'حدث خطأ في الخادم' if detect_language(request.json.get('question', '')) == 'ar' else 'Erreur de serveur'
        return jsonify({'error': f'{error_message}: {str(e)}'}), 500

def is_arabic_response(text):
    """Vérifie si la réponse contient principalement de l'arabe"""
    if not text:
        return False
    arabic_chars = re.findall(r'[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]', text)
    latin_chars = re.findall(r'[a-zA-Z]', text)
    
    return len(arabic_chars) > len(latin_chars) and len(arabic_chars) > len(text) * 0.4

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)