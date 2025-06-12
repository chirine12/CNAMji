// src/components/VoiceChat.tsx
import { useEffect } from "react";
import "./voicechat.css";

/**
 * Composant qui insère l’UI du chatbot puis lance le JS « vanilla »
 * contenu dans public/voicechat-script.js.
 */
const VoiceChat = () => {
  /* ------------------------------------------------------------ */
  /* Charge le script JS après le premier rendu                     */
  /* ------------------------------------------------------------ */
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/voicechat-script.js"; // <- placé dans /public
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // nettoyage si jamais le composant est démonté
      document.body.removeChild(script);
    };
  }, []);

  /* ------------------------------------------------------------ */
  /*  Injecte le markup HTML tel quel                              */
  /* ------------------------------------------------------------ */
  return (
    <div
      id="voice-chat-root"
      dangerouslySetInnerHTML={{ __html: RAW_MARKUP }}
    />
  );
};

export default VoiceChat;

/* ================================================================== */
/*  Tout le HTML SANS la balise <script> ni la balise <body>.         */
/*  On le met dans une constante pour pouvoir l’injecter.             */
/* ================================================================== */
const RAW_MARKUP = `
<div class="chat-container">
  <div class="chat-header">
    <button class="language-toggle" onclick="toggleLanguage()">🌐 العربية/Français</button>
    <span id="headerTitle">🏥 Expert Assurance-Maladie | Loi n° 2004-71</span>
    <button class="voice-settings-btn" onclick="toggleVoiceSettings()">🎙️ <span id="voiceSettingsText">Paramètres Vocaux</span></button>
  </div>

  <div class="voice-settings" id="voiceSettings">
    <div class="voice-controls-panel">
      <div class="voice-control-group">
        <label id="voiceSelectLabel">🎤 Voix française :</label>
        <select id="voiceSelect"><option value="">Chargement des voix...</option></select>
      </div>

      <div class="voice-control-group">
        <label>⚡ <span id="speedLabel">Vitesse</span> : <span id="rateValue">0.9</span></label>
        <input type="range" id="rateSlider" min="0.5" max="2" step="0.1" value="0.9">
      </div>

      <div class="voice-control-group">
        <label>🎵 <span id="pitchLabel">Tonalité</span> : <span id="pitchValue">1.0</span></label>
        <input type="range" id="pitchSlider" min="0.5" max="2" step="0.1" value="1.0">
      </div>

      <div class="voice-control-group">
        <label>🔊 <span id="volumeLabel">Volume</span> : <span id="volumeValue">1.0</span></label>
        <input type="range" id="volumeSlider" min="0.1" max="1" step="0.1" value="1.0">
      </div>
    </div>

    <div class="voice-preview">
      <button class="btn-preview" onclick="previewVoice()">🎯 <span id="testVoiceText">Tester la voix</span></button>
    </div>

    <div class="voice-status" id="voiceStatus">Recherche des voix disponibles...</div>
  </div>

  <div class="chat-messages" id="chatMessages">
    <div class="message assistant">
      <div class="message-content">
        <div class="message-header">
          <div></div>
          <div class="voice-controls">
            <button class="btn-voice-play" onclick="speakText(this, 'Bonjour ! Je suis votre expert…')" title="Écouter">🔊</button>
          </div>
        </div>
        <div id="welcomeMessage">
          🏥 <strong>Expert Assurance-Maladie - Loi n° 2004-71</strong>

          <!-- Calculateur de cotisations -->
          <div class="tariff-calculator">
            <h3>💼 <span id="calculatorTitle">Calculateur de Cotisations</span></h3>
            <div class="calculator-input">
              <input type="number" id="salaryInput" placeholder="Votre salaire mensuel (DT)" min="0" step="0.01">
              <button onclick="calculateContribution()"><span id="calculateBtn">Calculer</span></button>
            </div>
            <div id="calculationResult"></div>
          </div>

          <!-- Boutons rapides -->
          <div class="quick-buttons">
            <button class="quick-btn" onclick="showTariffs('consultations')">💊 <span id="consultationsBtn">Consultations</span></button>
            <button class="quick-btn" onclick="showTariffs('medicaments')">🏥 <span id="medicamentsBtn">Médicaments</span></button>
            <button class="quick-btn" onclick="showTariffs('hospitalisation')">🔬 <span id="hospitalisationBtn">Hospitalisation</span></button>
            <button class="quick-btn" onclick="showTariffs('examens')">📋 <span id="examensBtn">Examens</span></button>
          </div>

          <div id="tariffDisplay" style="display: none;">
            <div class="tariff-grid" id="tariffGrid"></div>
          </div>

          <div id="welcomeText">
            🎙️ <strong>Nouveau : Personnalisez ma voix !</strong><br>
            • Cliquez sur "Paramètres Vocaux"…<br><br>
            📋 <strong>Mes spécialités :</strong><br>
            • Tarifs et remboursements CNAM…<br><br>
            💬 Posez-moi vos questions !
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="loading" id="loading"><div class="spinner"></div><div id="loadingText">Traitement en cours...</div></div>

  <div class="chat-input">
    <div class="input-container">
      <input type="text" id="textInput" class="text-input" placeholder="Ex : Quel est le tarif…">
      <button id="voiceBtn" class="btn btn-voice" title="Enregistrement vocal">🎤</button>
      <button id="sendBtn" class="btn btn-send" title="Envoyer">➤</button>
    </div>
    <div class="status" id="status"></div>
  </div>
</div>
`;
