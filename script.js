let workouts = JSON.parse(localStorage.getItem("workouts")) || [];

let currentWorkout = {
    name: "",
    exercises: []
};


/* -------------------------
   DASHBOARD
------------------------- */

function showDashboard() {

    document.getElementById("workoutPanel").style.display = "none";

    document.getElementById("historyPanel").style.display = "none";

    updateDashboard();

}


/* -------------------------
   START WORKOUT
------------------------- */

function startWorkout() {

    document.getElementById("historyPanel").style.display = "none";

    document.getElementById("workoutPanel").style.display = "block";

    currentWorkout = {
        name: "",
        exercises: []
    };

    document.getElementById("workoutName").value = "";

    document.getElementById("exerciseList").innerHTML = "";

    document.getElementById("workoutVolume").textContent = "0";

    addExercise();

}


/* -------------------------
   ADD EXERCISE
------------------------- */

function addExercise() {

    const exerciseList =
        document.getElementById("exerciseList");


    const exerciseNumber =
        exerciseList.children.length + 1;


    const exercise = document.createElement("div");

    exercise.className = "exercise-box";


    exercise.innerHTML = `

        <input
            class="exercise-name"
            type="text"
            placeholder="Exercise ${exerciseNumber} e.g. Bench Press">


        <div class="sets">

            <div class="set-row">

                <span>Set 1</span>

                <input
                    class="weight"
                    type="number"
                    placeholder="kg"
                    min="0">

                <input
                    class="reps"
                    type="number"
                    placeholder="reps"
                    min="0">

            </div>

        </div>


        <button
            class="add-set"
            onclick="addSet(this)">

            + Add Set

        </button>

    `;


    exerciseList.appendChild(exercise);

}


/* -------------------------
   ADD SET
------------------------- */

function addSet(button) {

    const sets =
        button.parentElement.querySelector(".sets");


    const number =
        sets.children.length + 1;


    const row =
        document.createElement("div");


    row.className = "set-row";


    row.innerHTML = `

        <span>Set ${number}</span>

        <input
            class="weight"
            type="number"
            placeholder="kg"
            min="0">

        <input
            class="reps"
            type="number"
            placeholder="reps"
            min="0">

    `;


    sets.appendChild(row);


    updateWorkoutVolume();

}


/* -------------------------
   CALCULATE VOLUME
------------------------- */

function updateWorkoutVolume() {

    let volume = 0;


    document
        .querySelectorAll("#workoutPanel .set-row")
        .forEach(row => {

            const weight =
                Number(
                    row.querySelector(".weight").value
                ) || 0;


            const reps =
                Number(
                    row.querySelector(".reps").value
                ) || 0;


            volume += weight * reps;

        });


    document.getElementById("workoutVolume")
        .textContent = volume.toLocaleString();

}


/* -------------------------
   SAVE WORKOUT
------------------------- */

function saveWorkout() {

    const name =
        document.getElementById("workoutName").value.trim();


    if (!name) {

        alert("Give your workout a name first.");

        return;

    }


    const exerciseElements =
        document.querySelectorAll(".exercise-box");


    if (exerciseElements.length === 0) {

        alert("Add at least one exercise.");

        return;

    }


    const exercises = [];


    exerciseElements.forEach(element => {

        const exerciseName =
            element
            .querySelector(".exercise-name")
            .value.trim();


        if (!exerciseName) return;


        const sets = [];


        element
            .querySelectorAll(".set-row")
            .forEach(row => {

                const weight =
                    Number(
                        row.querySelector(".weight").value
                    ) || 0;


                const reps =
                    Number(
                        row.querySelector(".reps").value
                    ) || 0;


                if (weight > 0 && reps > 0) {

                    sets.push({
                        weight: weight,
                        reps: reps
                    });

                }

            });


        if (sets.length > 0) {

            exercises.push({
                name: exerciseName,
                sets: sets
            });

        }

    });


    if (exercises.length === 0) {

        alert("Enter at least one set.");

        return;

    }


    const workout = {

        id: Date.now(),

        name: name,

        date: new Date().toLocaleDateString("en-GB"),

        exercises: exercises

    };


    workouts.unshift(workout);


    localStorage.setItem(
        "workouts",
        JSON.stringify(workouts)
    );


    alert("Workout saved! 💪");


    showDashboard();

}


/* -------------------------
   DASHBOARD DATA
------------------------- */

function updateDashboard() {

    calculateStats();

    showRecentWorkout();

}


/* -------------------------
   STATS
------------------------- */

function calculateStats() {

    let totalVolume = 0;

    let prs = 0;

    let strengthScore = 0;


    workouts.forEach(workout => {

        workout.exercises.forEach(exercise => {

            let bestSet = 0;


            exercise.sets.forEach(set => {

                totalVolume +=
                    set.weight * set.reps;


                const estimated1RM =
                    set.weight *
                    (1 + set.reps / 30);


                if (estimated1RM > bestSet) {

                    bestSet = estimated1RM;

                }

            });


            strengthScore += bestSet;

        });

    });


    document.getElementById("weeklyVolume")
        .textContent =
        Math.round(totalVolume).toLocaleString()
        + " kg";


    prs = countPersonalRecords();


    document.getElementById("prCount")
        .textContent = prs;


    document.getElementById("strengthScore")
        .textContent =
        Math.round(strengthScore);

}


/* -------------------------
   PERSONAL RECORDS
------------------------- */

function countPersonalRecords() {

    const best = {};

    let count = 0;


    workouts.forEach(workout => {

        workout.exercises.forEach(exercise => {

            exercise.sets.forEach(set => {

                const estimated1RM =
                    set.weight *
                    (1 + set.reps / 30);


                if (
                    !best[exercise.name] ||
                    estimated1RM > best[exercise.name]
                ) {

                    best[exercise.name] =
                        estimated1RM;

                }

            });

        });

    });


    Object.keys(best).forEach(() => {

        count++;

    });


    return count;

}


/* -------------------------
   RECENT WORKOUT
------------------------- */

function showRecentWorkout() {

    const container =
        document.getElementById("recentWorkout");


    if (workouts.length === 0) {

        container.innerHTML = `

            <p class="workout-name">
                No workouts yet
            </p>

            <p style="color:#777">
                Start your first workout below.
            </p>

        `;

        return;

    }


    const workout = workouts[0];


    let html = `

        <p class="workout-name">
            ${workout.name}
        </p>

    `;


    workout.exercises.forEach(exercise => {

        const bestSet =
            exercise.sets[
                exercise.sets.length - 1
            ];


        html += `

            <div class="exercise">

                <strong>
                    ${exercise.name}
                </strong>

                <span>
                    ${bestSet.weight} kg ×
                    ${bestSet.reps}
                </span>

            </div>

        `;

    });


    container.innerHTML = html;

}


/* -------------------------
   HISTORY
------------------------- */

function showHistory() {

    document.getElementById("workoutPanel")
        .style.display = "none";


    document.getElementById("historyPanel")
        .style.display = "block";


    const history =
        document.getElementById("history");


    if (workouts.length === 0) {

        history.innerHTML =
            "<p>No workouts yet.</p>";

        return;

    }


    history.innerHTML = "";


    workouts.forEach(workout => {

        const div =
            document.createElement("div");


        div.className = "history-workout";


        div.innerHTML = `

            <h3>${workout.name}</h3>

            <p>${workout.date}</p>

            <ul>

                ${workout.exercises.map(exercise => `

                    <li>

                        <strong>
                            ${exercise.name}
                        </strong>

                        -
                        ${exercise.sets.length}
                        sets

                    </li>

                `).join("")}

            </ul>

        `;


        history.appendChild(div);

    });

}


/* -------------------------
   STARTUP
------------------------- */

document.addEventListener(
    "input",
    function(event) {

        if (
            event.target.classList.contains("weight") ||
            event.target.classList.contains("reps")
        ) {

            updateWorkoutVolume();

        }

    }
);


updateDashboard();
