// Body By Science Training App
class BodyByScienceApp {
    constructor() {
        this.exercises = [
            {
                id: 1,
                name: "Chest Press",
                muscleGroups: "Bryst, triceps, skuldre",
                bfr: "Arme - 5/10 stramhed",
                bfrLocation: "arme",
                instructions: "Langsom, kontrolleret bevægelse. Hold spænding gennem hele bevægelsen."
            },
            {
                id: 2,
                name: "Seated Row",
                muscleGroups: "Ryg, biceps",
                bfr: "Arme - 5/10 stramhed", 
                bfrLocation: "arme",
                instructions: "Træk skuldrene tilbage og ned. Fokuser på at klemme skulderbladene sammen."
            },
            {
                id: 3,
                name: "Lateral Raise",
                muscleGroups: "Skulder (side)",
                bfr: "Arme - 5/10 stramhed",
                bfrLocation: "arme", 
                instructions: "Løft armene til siden indtil parallel med gulvet. Kontrolleret bevægelse."
            },
            {
                id: 4,
                name: "Rear Delt",
                muscleGroups: "Skulder (bag), øvre ryg",
                bfr: "Arme - 5/10 stramhed",
                bfrLocation: "arme",
                instructions: "Træk armene bagud og klem skulderbladene sammen."
            },
            {
                id: 5,
                name: "Leg Extension", 
                muscleGroups: "Forside lår (quadriceps)",
                bfr: "Ben - 7/10 stramhed",
                bfrLocation: "ben",
                instructions: "Ret benene langsomt og hold kort pause øverst."
            },
            {
                id: 6,
                name: "Leg Curl",
                muscleGroups: "Bagside lår (hamstrings)", 
                bfr: "Ben - 7/10 stramhed",
                bfrLocation: "ben",
                instructions: "Træk hælene mod bagdelen. Langsom, kontrolleret bevægelse."
            }
        ];

        this.bfrProtocol = {
            arme: "Spænd båndene til 5/10 på en skala hvor 10 er maksimalt stramme",
            ben: "Spænd båndene til 7/10 på en skala hvor 10 er maksimalt stramme"
        };

        this.currentExerciseIndex = 0;
        this.currentExercise = this.exercises[0];
        this.timerInterval = null;
        this.countdownInterval = null;
        this.currentTime = 0;
        this.isTimerRunning = false;
        this.isCountdown = false;
        this.countdownTime = 5;
        this.lastSessionTUT = 0;
        this.currentWeight = 10;
        
        this.mainChart = null;
        this.exerciseChart = null;

        this.initializeApp();
    }

    initializeApp() {
        this.loadExerciseList();
        this.loadTotalStats();
        this.setupEventListeners();
        this.loadMainChart();
        this.showHomepage();
        this.setupManualDataForm();
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('back-to-home').addEventListener('click', () => this.showHomepage());
        document.getElementById('prev-exercise').addEventListener('click', () => this.navigateExercise(-1));
        document.getElementById('next-exercise').addEventListener('click', () => this.navigateExercise(1));

        // Weight controls
        document.getElementById('increase-weight').addEventListener('click', () => this.adjustWeight(1));
        document.getElementById('decrease-weight').addEventListener('click', () => this.adjustWeight(-1));
        document.getElementById('weight-value').addEventListener('change', (e) => this.setWeight(e.target.value));

        // Timer controls
        document.getElementById('start-timer').addEventListener('click', () => this.startTimer());
        document.getElementById('stop-timer').addEventListener('click', () => this.stopTimer());
        document.getElementById('save-performance').addEventListener('click', () => this.savePerformance());
    }

    setupManualDataForm() {
        const form = document.getElementById('manual-data-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const date = document.getElementById('input-date').value;
            const weight = parseInt(document.getElementById('input-weight').value);
            const tut = parseInt(document.getElementById('input-tut').value);
            const exerciseId = parseInt(document.getElementById('input-exercise').value);

            if (!date || !weight || !tut || !exerciseId) {
                this.showSuccessMessage('Venligst udfyld alle felter');
                return;
            }

            const data = {
                date: new Date(date).toISOString(),
                weight: weight,
                tut: tut,
                tutPerKg: tut / weight
            };

            this.saveTrainingData(exerciseId, data);
            this.loadMainChart();
            this.loadTotalStats();
            form.reset();
            this.showSuccessMessage('Data gemt succesfuldt');
        });
    }

    showHomepage() {
        document.getElementById('homepage').classList.add('active');
        document.getElementById('exercise-page').classList.remove('active');
        this.loadTotalStats();
        this.loadMainChart();
    }

    showExercisePage(exerciseIndex) {
        this.currentExerciseIndex = exerciseIndex;
        this.currentExercise = this.exercises[exerciseIndex];
        
        document.getElementById('homepage').classList.remove('active');
        document.getElementById('exercise-page').classList.add('active');
        
        this.loadExerciseData();
        this.loadExerciseChart();
        this.resetTimer();
    }

    loadExerciseList() {
        const exerciseGrid = document.querySelector('.exercise-grid');
        exerciseGrid.innerHTML = '';

        this.exercises.forEach((exercise, index) => {
            const exerciseCard = document.createElement('div');
            exerciseCard.className = 'exercise-card';
            exerciseCard.innerHTML = `
                <h4>${exercise.name}</h4>
                <p><strong>Muskelgrupper:</strong> ${exercise.muscleGroups}</p>
                <p><strong>BFR:</strong> ${exercise.bfr}</p>
            `;
            exerciseCard.addEventListener('click', () => this.showExercisePage(index));
            exerciseGrid.appendChild(exerciseCard);
        });
    }

    loadExerciseData() {
        const exercise = this.currentExercise;
        
        document.getElementById('exercise-name').textContent = exercise.name;
        document.getElementById('muscle-groups').textContent = exercise.muscleGroups;
        document.getElementById('bfr-info').textContent = exercise.bfr;
        document.getElementById('bfr-protocol').textContent = this.bfrProtocol[exercise.bfrLocation];
        document.getElementById('exercise-instructions').textContent = exercise.instructions;
        document.getElementById('exercise-progress-text').textContent = `Øvelse ${this.currentExerciseIndex + 1} af ${this.exercises.length}`;

        // Load last used weight
        const savedWeight = this.getLastWeight(exercise.id);
        this.currentWeight = savedWeight || 10;
        document.getElementById('weight-value').value = this.currentWeight;

        // Load last session TUT for this exercise
        this.lastSessionTUT = this.getLastTUT(exercise.id);

        // Update navigation buttons
        document.getElementById('prev-exercise').disabled = this.currentExerciseIndex === 0;
        document.getElementById('next-exercise').disabled = this.currentExerciseIndex === this.exercises.length - 1;
    }

    adjustWeight(delta) {
        // Allow any positive weight above 1
        this.currentWeight = Math.max(1, parseInt(this.currentWeight) + delta);
        document.getElementById('weight-value').value = this.currentWeight;
    }

    setWeight(value) {
        // Allow any positive weight above 1
        this.currentWeight = Math.max(1, parseInt(value) || 1);
        document.getElementById('weight-value').value = this.currentWeight;
    }

    navigateExercise(direction) {
        const newIndex = this.currentExerciseIndex + direction;
        if (newIndex >= 0 && newIndex < this.exercises.length) {
            this.showExercisePage(newIndex);
        }
    }

    startTimer() {
        if (this.isTimerRunning) return;

        this.isTimerRunning = true;
        this.isCountdown = true;
        this.countdownTime = 5;
        this.currentTime = 0;

        document.getElementById('start-timer').disabled = true;
        document.getElementById('stop-timer').disabled = false;
        document.getElementById('save-performance').disabled = true;

        this.startCountdown();
    }

    startCountdown() {
        const countdownDisplay = document.getElementById('countdown-display');
        const timerValue = document.getElementById('timer-value');
        const timerStatus = document.getElementById('timer-status');

        timerStatus.textContent = 'Forberedelse';
        timerValue.textContent = this.countdownTime;
        timerValue.className = 'timer-value active-red';
        
        this.countdownInterval = setInterval(() => {
            if (this.countdownTime > 1) {
                this.countdownTime--;
                countdownDisplay.textContent = this.countdownTime;
                timerValue.textContent = this.countdownTime;
                this.playBeep();
            } else {
                countdownDisplay.textContent = 'START!';
                timerValue.textContent = 'START!';
                this.playBeep();
                
                setTimeout(() => {
                    this.startMainTimer();
                }, 1000);
                
                clearInterval(this.countdownInterval);
            }
        }, 1000);
    }

    startMainTimer() {
        const countdownDisplay = document.getElementById('countdown-display');
        const timerValue = document.getElementById('timer-value');
        const timerStatus = document.getElementById('timer-status');

        this.isCountdown = false;
        this.currentTime = 0;
        countdownDisplay.textContent = '';
        timerStatus.textContent = 'Aktiv';

        this.timerInterval = setInterval(() => {
            this.currentTime++;
            timerValue.textContent = this.currentTime;
            
            // Change color based on performance vs last session
            if (this.currentTime >= this.lastSessionTUT) {
                timerValue.className = 'timer-value active-green';
            } else {
                timerValue.className = 'timer-value active-red';
            }
        }, 1000);
    }

    stopTimer() {
        if (!this.isTimerRunning) return;

        this.isTimerRunning = false;
        
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        document.getElementById('start-timer').disabled = false;
        document.getElementById('stop-timer').disabled = true;
        document.getElementById('timer-status').textContent = 'Stoppet';
        
        if (!this.isCountdown && this.currentTime > 0) {
            document.getElementById('save-performance').disabled = false;
        }
    }

    resetTimer() {
        this.stopTimer();
        this.currentTime = 0;
        this.countdownTime = 5;
        this.isCountdown = false;
        
        document.getElementById('countdown-display').textContent = 'Klar';
        document.getElementById('timer-value').textContent = '0';
        document.getElementById('timer-value').className = 'timer-value';
        document.getElementById('timer-status').textContent = 'Inaktiv';
        document.getElementById('save-performance').disabled = true;
    }

    savePerformance() {
        if (this.currentTime === 0) return;

        const exerciseId = this.currentExercise.id;
        const date = new Date().toISOString().split('T')[0];
        const tut = this.currentTime;
        const weight = this.currentWeight;
        const tutPerKg = parseFloat((tut / weight).toFixed(2));

        // Save to localStorage
        this.saveTrainingData(exerciseId, {
            date: date,
            tut: tut,
            weight: weight,
            tutPerKg: tutPerKg
        });

        // Save last used weight
        this.saveLastWeight(exerciseId, weight);

        // Update charts
        this.loadExerciseChart();
        this.loadMainChart();
        
        // Reset timer
        this.resetTimer();

        // Show success message
        this.showSuccessMessage(`Præstation gemt: ${tut}s TUT, ${weight}kg (${tutPerKg} TUT/kg)`);
    }

    saveTrainingData(exerciseId, data) {
        const key = `exercise_${exerciseId}_history`;
        const history = JSON.parse(localStorage.getItem(key) || '[]');
        history.push(data);
        localStorage.setItem(key, JSON.stringify(history));
    }

    getTrainingData(exerciseId) {
        const key = `exercise_${exerciseId}_history`;
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    saveLastWeight(exerciseId, weight) {
        localStorage.setItem(`exercise_${exerciseId}_last_weight`, weight.toString());
    }

    getLastWeight(exerciseId) {
        const weight = localStorage.getItem(`exercise_${exerciseId}_last_weight`);
        return weight ? parseInt(weight) : null;
    }

    getLastTUT(exerciseId) {
        const history = this.getTrainingData(exerciseId);
        return history.length > 0 ? history[history.length - 1].tut : 0;
    }

    getAllTrainingData() {
        const allData = [];
        this.exercises.forEach(exercise => {
            const history = this.getTrainingData(exercise.id);
            history.forEach(session => {
                allData.push({
                    ...session,
                    exerciseId: exercise.id,
                    exerciseName: exercise.name
                });
            });
        });
        return allData.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    loadTotalStats() {
        const allData = this.getAllTrainingData();
        const totalTime = allData.reduce((sum, session) => sum + session.tut, 0);
        
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('total-training-time').textContent = timeString;
    }

    loadMainChart() {
        const ctx = document.getElementById('main-progress-chart').getContext('2d');
        const allData = this.getAllTrainingData();
        
        // Group by date and calculate average TUT per kg
        const dateGroups = {};
        allData.forEach(session => {
            if (!dateGroups[session.date]) {
                dateGroups[session.date] = [];
            }
            dateGroups[session.date].push(session.tutPerKg);
        });

        const chartData = Object.keys(dateGroups).map(date => ({
            x: date,
            y: dateGroups[date].reduce((sum, val) => sum + val, 0) / dateGroups[date].length
        }));

        if (this.mainChart) {
            this.mainChart.destroy();
        }

        this.mainChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Gennemsnitlig TUT per kg',
                    data: chartData,
                    borderColor: '#ff8c00',
                    backgroundColor: 'rgba(255, 140, 0, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        },
                        ticks: {
                            color: '#cccccc'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#cccccc'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    loadExerciseChart() {
        const ctx = document.getElementById('exercise-progress-chart').getContext('2d');
        const exerciseData = this.getTrainingData(this.currentExercise.id);
        
        const chartData = exerciseData.map(session => ({
            x: session.date,
            y: session.tutPerKg
        }));

        if (this.exerciseChart) {
            this.exerciseChart.destroy();
        }

        this.exerciseChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'TUT per kg',
                    data: chartData,
                    borderColor: '#ff8c00',
                    backgroundColor: 'rgba(255, 140, 0, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        },
                        ticks: {
                            color: '#cccccc'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#cccccc'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    playBeep() {
        const beepSound = document.getElementById('beep-sound');
        if (beepSound) {
            beepSound.currentTime = 0;
            beepSound.play().catch(e => {
                // Fallback for browsers that don't support audio
                console.log('Audio not supported');
            });
        }
    }

    showSuccessMessage(message) {
        // Create a temporary success message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #44ff44;
            color: #1a1a1a;
            padding: 16px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BodyByScienceApp();
});

// Add CSS animation for success message
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);