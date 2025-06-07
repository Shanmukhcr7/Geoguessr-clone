const GOOGLE_API_KEY = "AIzaSyArLGgPN9nOzUOORNUBGUCnW5tGxc5UB3Q"; // Replace with your actual Google API Key

// Locations by difficulty
const locations = {
    easy: [
        { name: "New York, USA", lat: 40.7128, lng: -74.006 },
        { name: "Paris, France", lat: 48.8566, lng: 2.3522 },
        { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 },
        { name: "London, UK", lat: 51.5074, lng: -0.1278 },
        { name: "Sydney, Australia", lat: -33.8688, lng: 151.2093 },
        { name: "Berlin, Germany", lat: 52.52, lng: 13.405 },
        { name: "Mumbai, India", lat: 19.076, lng: 72.8777 },
        { name: "Toronto, Canada", lat: 43.65107, lng: -79.347015 },
        { name: "Moscow, Russia", lat: 55.7558, lng: 37.6173 },
        { name: "Cape Town, South Africa", lat: -33.9249, lng: 18.4241 },
    ],
    medium: [
        { name: "New York, USA", lat: 40.7128, lng: -74.006 },
        { name: "Paris, France", lat: 48.8566, lng: 2.3522 },
        { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 },
        { name: "London, UK", lat: 51.5074, lng: -0.1278 },
        { name: "Sydney, Australia", lat: -33.8688, lng: 151.2093 },
        { name: "Berlin, Germany", lat: 52.52, lng: 13.405 },
        { name: "Mumbai, India", lat: 19.076, lng: 72.8777 },
        { name: "Toronto, Canada", lat: 43.65107, lng: -79.347015 },
        { name: "Moscow, Russia", lat: 55.7558, lng: 37.6173 },
        { name: "Cape Town, South Africa", lat: -33.9249, lng: 18.4241 },
        { name: "Mexico City, Mexico", lat: 19.4326, lng: -99.1332 },
        { name: "São Paulo, Brazil", lat: -23.5505, lng: -46.6333 },
        { name: "Seoul, South Korea", lat: 37.5665, lng: 126.978 },
        { name: "Rome, Italy", lat: 41.9028, lng: 12.4964 },
        { name: "Bangkok, Thailand", lat: 13.7563, lng: 100.5018 },
    ],
    hard: [
        { name: "New York, USA", lat: 40.7128, lng: -74.006 },
        { name: "Paris, France", lat: 48.8566, lng: 2.3522 },
        { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 },
        { name: "London, UK", lat: 51.5074, lng: -0.1278 },
        { name: "Sydney, Australia", lat: -33.8688, lng: 151.2093 },
        { name: "Berlin, Germany", lat: 52.52, lng: 13.405 },
        { name: "Mumbai, India", lat: 19.076, lng: 72.8777 },
        { name: "Toronto, Canada", lat: 43.65107, lng: -79.347015 },
        { name: "Moscow, Russia", lat: 55.7558, lng: 37.6173 },
        { name: "Cape Town, South Africa", lat: -33.9249, lng: 18.4241 },
        { name: "Mexico City, Mexico", lat: 19.4326, lng: -99.1332 },
        { name: "São Paulo, Brazil", lat: -23.5505, lng: -46.6333 },
        { name: "Seoul, South Korea", lat: 37.5665, lng: 126.978 },
        { name: "Rome, Italy", lat: 41.9028, lng: 12.4964 },
        { name: "Bangkok, Thailand", lat: 13.7563, lng: 100.5018 },
        { name: "Lagos, Nigeria", lat: 6.5244, lng: 3.3792 },
        { name: "Buenos Aires, Argentina", lat: -34.6037, lng: -58.3816 },
        { name: "Cairo, Egypt", lat: 30.0444, lng: 31.2357 },
        { name: "Istanbul, Turkey", lat: 41.0082, lng: 28.9784 },
        { name: "Dubai, UAE", lat: 25.2048, lng: 55.2708 },
    ],
};

const totalRounds = 5;
const timePerRound = 30;

let actualLocation = null;
let actualCityName = null;
let guessMarker = null;
let actualMarker = null;
let lineBetween = null;
let map = null;

let currentRound = 1;
let score = 0;
let timerInterval = null;
let timeLeft = timePerRound;
let timerBeepInterval = null;

const streetViewDiv = document.getElementById("street-view");
const guessButton = document.getElementById("guess-button");
const nextRoundButton = document.getElementById("next-round-button");
const difficultySelect = document.getElementById("difficulty");

const resultP = document.getElementById("result");
const hintP = document.getElementById("hint");
const currentScoreP = document.getElementById("current-score");
const currentRoundP = document.getElementById("current-round");
const timerP = document.getElementById("timer");
const timerBar = document.getElementById("timer-bar");
const scorePopup = document.getElementById("score-popup");

// Custom Modal Elements
const customModal = document.getElementById('custom-modal');
const modalMessage = document.getElementById('modal-message');
const modalConfirmButton = document.getElementById('modal-confirm-button');
const modalCancelButton = document.getElementById('modal-cancel-button');
const closeButton = document.querySelector('.close-button');

// --- Tone.js Sound Setup ---
let guessSynth, correctSynth, incorrectSynth, timerBeep, roundEndSynth, gameOverSynth;
let audioContextStarted = false;

// Function to initialize audio context on first user interaction
function initializeAudio() {
    if (audioContextStarted) return;
    Tone.start().then(() => {
        console.log("AudioContext started successfully!");
        audioContextStarted = true;
        setupSynths();
    }).catch(e => console.error("Failed to start AudioContext:", e));
}

// Setup all synthesizers
function setupSynths() {
    // Basic synth for general interactions/clicks
    guessSynth = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.005, decay: 0.05, sustain: 0.1, release: 0.1 }
    }).toDestination();

    // Synth for correct guesses (pleasant, rising)
    correctSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.3 }
    }).toDestination();

    // Synth for incorrect guesses (dissonant, falling)
    incorrectSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.4 }
    }).toDestination();

    // Synth for timer beeps
    timerBeep = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 8,
        envelope: { attack: 0.001, decay: 0.1, sustain: 0.001, release: 0.01 }
    }).toDestination();

    // Synth for round end
    roundEndSynth = new Tone.AMSynth({
        harmonicity: 1.5,
        oscillator: { type: "sine" },
        envelope: { attack: 0.02, decay: 0.5, sustain: 0.1, release: 0.8 },
        modulation: { type: "square" },
        modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.01, release: 0.01 }
    }).toDestination();

    // Synth for game over
    gameOverSynth = new Tone.DuoSynth({
        vibratoAmount: 0.5,
        vibratoRate: 5,
        harmonicity: 1.5,
        voice0: {
            oscillator: { type: "sine" },
            envelope: { attack: 0.02, decay: 0.5, sustain: 0.1, release: 0.8 }
        },
        voice1: {
            oscillator: { type: "sine" },
            envelope: { attack: 0.05, decay: 0.3, sustain: 0.1, release: 1 }
        }
    }).toDestination();
}

// Call initializeAudio on first click/interaction
document.documentElement.addEventListener('mousedown', initializeAudio, { once: true });
document.documentElement.addEventListener('touchstart', initializeAudio, { once: true });


// --- Custom Modal Functions ---

/**
 * Shows a custom modal with one 'OK' button.
 * @param {string} message - The message to display.
 * @param {function} onOk - Callback function when 'OK' is clicked.
 * @param {string} okButtonText - Custom text for the OK button (defaults to 'OK').
 */
function showAlertDialog(message, onOk = () => {}, okButtonText = 'OK') {
    modalMessage.innerHTML = message; // Use innerHTML for potential formatting like bold
    modalConfirmButton.textContent = okButtonText;
    modalCancelButton.style.display = 'none'; // Hide cancel button
    modalConfirmButton.style.display = 'inline-block';

    customModal.style.display = 'flex'; // Show modal

    const handleOk = () => {
        onOk();
        customModal.style.display = 'none';
        modalConfirmButton.removeEventListener('click', handleOk);
        closeButton.removeEventListener('click', handleOk);
    };

    modalConfirmButton.addEventListener('click', handleOk);
    closeButton.addEventListener('click', handleOk);
}

/**
 * Shows a custom modal with 'Confirm' and 'Cancel' buttons.
 * @param {string} message - The message to display.
 * @param {function} onConfirm - Callback function if 'Confirm' is clicked.
 * @param {function} onCancel - Callback function if 'Cancel' is clicked (optional).
 */
function showConfirmDialog(message, onConfirm, onCancel = () => {}) {
    modalMessage.innerHTML = message;
    modalConfirmButton.textContent = 'Confirm';
    modalCancelButton.textContent = 'Cancel';
    modalCancelButton.style.display = 'inline-block'; // Show cancel button
    modalConfirmButton.style.display = 'inline-block';

    customModal.style.display = 'flex'; // Show modal

    const handleConfirm = () => {
        onConfirm();
        customModal.style.display = 'none';
        modalConfirmButton.removeEventListener('click', handleConfirm);
        modalCancelButton.removeEventListener('click', handleCancel);
        closeButton.removeEventListener('click', handleCancel);
    };

    const handleCancel = () => {
        onCancel();
        customModal.style.display = 'none';
        modalConfirmButton.removeEventListener('click', handleConfirm);
        modalCancelButton.removeEventListener('click', handleCancel);
        closeButton.removeEventListener('click', handleCancel);
    };

    modalConfirmButton.addEventListener('click', handleConfirm);
    modalCancelButton.addEventListener('click', handleCancel);
    closeButton.addEventListener('click', handleCancel);
}


// --- Game Logic Functions (with sound integration) ---

/**
 * Generates random coordinates based on the selected difficulty.
 * Difficulty affects the offset from the chosen city center.
 * @param {string} difficulty - 'easy', 'medium', or 'hard'.
 * @returns {object} - An object containing lat, lng, and cityName.
 */
function getRandomCoords(difficulty) {
    const cityList = locations[difficulty];
    const city = cityList[Math.floor(Math.random() * cityList.length)];
    let latOffset, lngOffset;

    switch (difficulty) {
        case "easy":
            latOffset = (Math.random() - 0.5) * 0.005;
            lngOffset = (Math.random() - 0.5) * 0.005;
            break;
        case "medium":
            latOffset = (Math.random() - 0.5) * 0.02;
            lngOffset = (Math.random() - 0.5) * 0.02;
            break;
        case "hard":
            latOffset = (Math.random() - 0.5) * 0.2;
            lngOffset = (Math.random() - 0.5) * 0.2;
            break;
        default:
            latOffset = (Math.random() - 0.5) * 0.02;
            lngOffset = (Math.random() - 0.5) * 0.02;
    }

    return {
        lat: city.lat + latOffset,
        lng: city.lng + lngOffset,
        cityName: city.name,
    };
}

/**
 * Loads a Street View image from Google Street View Static API.
 * Retries if no Street View data is available for the generated coordinates.
 * @param {number} retries - Number of remaining retries.
 * @returns {Promise<boolean>} - True if image loaded successfully, false otherwise.
 */
function loadStreetViewImage(retries = 10) {
    streetViewDiv.innerHTML = `<p>Loading Street View...</p><div class="spinner"></div>`;

    const difficulty = difficultySelect.value;
    const coordsObj = getRandomCoords(difficulty);
    const coords = { lat: coordsObj.lat, lng: coordsObj.lng };
    const metadataUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${coords.lat},${coords.lng}&key=${GOOGLE_API_KEY}`;

    return fetch(metadataUrl)
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "OK" && data.pano_id) {
                actualLocation = coords;
                actualCityName = coordsObj.cityName;
                const imageUrl = `https://maps.googleapis.com/maps/api/streetview?size=900x600&location=${coords.lat},${coords.lng}&fov=90&heading=${Math.random() * 360}&pitch=0&key=${GOOGLE_API_KEY}`;
                streetViewDiv.innerHTML = `<img src="${imageUrl}" alt="Street View Image" onerror="this.onerror=null; this.src='https://placehold.co/900x600/334a5c/ffffff?text=Image+Load+Error'; this.alt='Error loading image';" />`;
                return true;
            } else if (retries > 0) {
                return loadStreetViewImage(retries - 1);
            } else {
                streetViewDiv.innerHTML = `<p>No Street View available after multiple attempts. Please ensure API key is valid or try again.</p>`;
                showAlertDialog("No Street View available for multiple generated locations. Check API key or reload.");
                return false;
            }
        })
        .catch((error) => {
            console.error("Error fetching Street View metadata:", error);
            streetViewDiv.innerHTML = `<p>Error loading Street View. Check your internet connection or API key.</p>`;
            showAlertDialog("Error loading Street View data. Please check your internet connection or API key.");
            return false;
        });
}

/**
 * Initializes the Leaflet map.
 */
function initMap() {
    map = L.map("map").setView([20, 0], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    map.on("click", function (e) {
        if (guessButton.disabled === false) {
            if (guessMarker) {
                guessMarker.setLatLng(e.latlng);
            } else {
                guessMarker = L.marker(e.latlng, { title: "Your Guess" }).addTo(map);
            }
            if (audioContextStarted && guessSynth) {
                guessSynth.triggerAttackRelease("C4", "8n");
            }
        }
    });
}

/**
 * Calculates the distance between two geographical points using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1.
 * @param {number} lon1 - Longitude of point 1.
 * @param {number} lat2 - Latitude of point 2.
 * @param {number} lon2 - Longitude of point 2.
 * @returns {number} - Distance in kilometers.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    function toRad(x) {
        return (x * Math.PI) / 180;
    }

    const R = 6371; // Radius of Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Starts the round timer.
 */
function startTimer() {
    timeLeft = timePerRound;
    timerP.textContent = `Time left: ${timeLeft}s`;
    timerBar.style.width = "100%";
    timerBar.style.backgroundColor = "#00e676";

    clearInterval(timerInterval);
    clearInterval(timerBeepInterval); // Clear any existing timer beep interval

    timerInterval = setInterval(() => {
        timeLeft--;
        timerP.textContent = `Time left: ${timeLeft}s`;
        const percentage = (timeLeft / timePerRound) * 100;
        timerBar.style.width = `${percentage}%`;

        if (timeLeft <= 5 && timeLeft > 0 && audioContextStarted && timerBeep) {
            timerBeep.triggerAttackRelease("C2", "16n");
        }

        if (percentage > 60) {
            timerBar.style.backgroundColor = "#00e676";
        } else if (percentage > 30) {
            timerBar.style.backgroundColor = "#ffa000";
        } else {
            timerBar.style.backgroundColor = "#ff5252";
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            clearInterval(timerBeepInterval);

            guessButton.disabled = true;
            timerP.textContent = "Time's up!";
            nextRoundButton.disabled = false;

            if (audioContextStarted && roundEndSynth) {
                roundEndSynth.triggerAttackRelease("C3", "0.5");
            }

            if (!guessMarker) {
                showAlertDialog("Time's up! No guess was made for this round. You scored 0 points.", makeGuess);
            } else {
                 makeGuess();
            }
        }
    }, 1000);
}

/**
 * Displays an animated score pop-up.
 * @param {number} points - The points scored.
 */
function showScorePopup(points) {
    scorePopup.textContent = `+${points} points!`;
    scorePopup.classList.add('active');

    scorePopup.addEventListener('animationend', () => {
        scorePopup.classList.remove('active');
        scorePopup.textContent = '';
    }, { once: true });
}

/**
 * Processes the user's guess, calculates score, and reveals the actual location.
 */
function makeGuess() {
    if (!guessMarker && timeLeft > 0) {
        showAlertDialog("Please click on the map to make your guess!");
        return;
    }

    clearInterval(timerInterval);
    clearInterval(timerBeepInterval); // Stop beeps when guess is made
    guessButton.disabled = true;
    nextRoundButton.disabled = false;

    const guessLatLng = guessMarker ? guessMarker.getLatLng() : null;
    let distKm = 0;
    let roundScore = 0;

    if (guessLatLng && actualLocation) {
        distKm = calculateDistance(
            guessLatLng.lat,
            guessLatLng.lng,
            actualLocation.lat,
            actualLocation.lng
        );

        const maxScore = 5000;
        const maxDistance = 15000;

        if (distKm < maxDistance) {
            roundScore = maxScore * Math.pow(1 - distKm / maxDistance, 1.5);
        }
        roundScore = Math.round(roundScore);
    }

    score += roundScore;
    currentScoreP.textContent = `Score: ${score}`;

    if (audioContextStarted) {
        if (roundScore > (0.8 * 5000) && correctSynth) {
            correctSynth.triggerAttackRelease(["C5", "E5", "G5"], "0.3");
        } else if (roundScore > 0 && correctSynth) { // Still a 'correct' sound for any points
            correctSynth.triggerAttackRelease("C4", "0.2");
        } else if (incorrectSynth) {
            incorrectSynth.triggerAttackRelease(["C3", "G#2"], "0.4");
        }
    }

    showScorePopup(roundScore);

    if (guessLatLng) {
        resultP.textContent = `Your guess was ${distKm.toFixed(2)} km away. You scored ${roundScore} points.`;
        if (roundScore > (0.8 * 5000)) {
            resultP.className = "correct";
        } else if (roundScore > (0.3 * 5000)) {
            resultP.className = "medium-correct";
        } else {
            resultP.className = "incorrect";
        }
    } else {
        resultP.textContent = "No guess made. You scored 0 points.";
        resultP.className = "incorrect";
    }

    hintP.textContent = `Actual location was near ${actualCityName}.`;

    if (actualMarker) map.removeLayer(actualMarker);
    actualMarker = L.marker(actualLocation, {
        title: "Actual Location",
        icon: L.icon({
            iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
        }),
    }).addTo(map);

    if (guessLatLng) {
        if (lineBetween) map.removeLayer(lineBetween);
        lineBetween = L.polyline([guessLatLng, actualLocation], {
            color: '#ff5252',
            weight: 4,
            opacity: 0.8,
            dashArray: "8,8",
        }).addTo(map);

        map.fitBounds(L.latLngBounds([guessLatLng, actualLocation]), {
            padding: [70, 70],
        });
    } else {
        map.setView(actualLocation, 6);
    }
}

/**
 * Proceeds to the next round or ends the game.
 */
function nextRound() {
    currentRound++;
    // Crucial: Stop any currently playing game over sound before checking
    if (audioContextStarted && gameOverSynth) {
        gameOverSynth.triggerRelease(); // Stop the sound immediately if it's playing
    }

    if (currentRound > totalRounds) {
        if (audioContextStarted && gameOverSynth) {
            gameOverSynth.triggerAttackRelease(["C3", "F2"], "1.5s"); // Play game over sound for a fixed duration
        }
        // Use s