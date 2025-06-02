"use strict"
const tableWrapper = document.getElementById("tableWrapper");
const sidebarContainer = document.getElementById("sidebarContainer");
const formContainer = document.getElementById("formContainer");
const form = document.querySelector("form");
const topicInp = document.getElementById("topicInp");
const questionInp = document.getElementById("questionInp");
const levelInp = document.getElementById("levelInp");
const linkInp = document.getElementById("linkInp");
const companyInp = document.getElementById("companyInp");
const submitBtn = document.getElementById("submitBtn");
const selectLevel = document.getElementById("selLevel");
const selectTopic = document.getElementById("selTopic");
let isEditMode = false;
let editIdx = null;
let listArr = [];
let topicArr = [];
let countingArr = [];
let isFilter = false;
let filterArr = [];

window.addEventListener("load", () => {
    if (localStorage.getItem("listArr") != null) {
        listArr = []
        listArr = JSON.parse(localStorage.getItem("listArr"));
        updateTable(listArr)
        selectTopicOptions()
    }
})

window.addEventListener("storage", () => {
    let con = confirm("Storage has change want to refresh website")
    if (con) {
        location.reload()
    }
})

function popUp(ele) {
    if (ele.getAttribute("data-bs-display") == "true") {
        ele.setAttribute("data-bs-display", "processFalse");
        ele.addEventListener("animationend", () => { ele.setAttribute("data-bs-display", "false"), submitBtn.innerText = "Add", isEditMode = false, editIdx = null }, { once: true });
    }
    else {
        ele.setAttribute("data-bs-display", "true");
    }
}

form.addEventListener("submit", (e) => {
    e.preventDefault()
    if (!isEditMode) {
        addList();
        selectTopicOptions()
    }
    else {
        listArr[editIdx].topic = topicInp.value
        listArr[editIdx].question = questionInp.value
        listArr[editIdx].level = levelInp.value
        listArr[editIdx].link = linkInp.value
        listArr[editIdx].company = companyInp.value
        isEditMode = false;
        editIdx = null;
        if (isFilter) {
            filter()
        } else {
            updateTable(listArr)
        }
        popUp(formContainer);
        formContainer.addEventListener("animationend", () => { submitBtn.innerText = "Add" }, { once: true });
    }
    counting()
    localStorage.setItem("listArr", JSON.stringify(listArr));
})

function addList() {
    let listObj = {
        id: listArr.length,
        topic: topicInp.value.toLowerCase(),
        question: questionInp.value.toLowerCase(),
        level: levelInp.value.toLowerCase(),
        link: linkInp.value.toLowerCase(),
        company: companyInp.value.toLowerCase(),
        complete: false
    }
    listArr.push(listObj);
    form.reset();
    updateTable(listArr);
    counting()
}

function updateList(id) {
    isEditMode = true;
    editIdx = id;
    popUp(formContainer);
    topicInp.value = listArr[id].topic.toLowerCase()
    questionInp.value = listArr[id].question.toLowerCase()
    levelInp.value = listArr[id].level.toLowerCase()
    linkInp.value = listArr[id].link.toLowerCase()
    companyInp.value = listArr[id].company.toLowerCase()
    submitBtn.innerText = "Edit"
}

function delList(id) {
    listArr.splice(id, 1)
    for (let i = 0; i < listArr.length; i++) {
        listArr[i].id = i
    }
    if (isFilter) {
        filter()
    } else {
        updateTable(listArr)
    }
    selectTopicOptions()
    localStorage.setItem("listArr", JSON.stringify(listArr));

}

function toggleTaskComplete(idx) {
    listArr[idx].complete = !(listArr[idx].complete);
    if (isFilter) {
        filter()
    } else {
        updateTable(listArr)
    }
    selectTopicOptions()
    let totalCount = countingArr.reduce((acc, ele) => {
        return acc += ele.easyCount + ele.medCount + ele.diffCount;
    }, 0)
    let totalCompleteCount = countingArr.reduce((acc, ele) => {
        return acc += ele.easyCompleteCount + ele.medCompleteCount + ele.diffCompleteCount;
    }, 0)
    if (listArr.length != 0 && (totalCount == totalCompleteCount)) {
        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });

        fire(0.2, {
            spread: 60,
        });

        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8,
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2,
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    }
    localStorage.setItem("listArr", JSON.stringify(listArr));
}
selectLevel.addEventListener("change", () => { filter() })
selectTopic.addEventListener("change", () => { filter() })
function filter() {
    filterArr = [];
    filterArr = listArr.filter((ele) => {
        if (selectLevel.value == "all" && selectTopic.value == "all") {
            isFilter = false;
            return true;
        }
        else if (selectLevel.value == "all" && selectTopic.value == ele.topic) {
            isFilter = true;
            return selectTopic.value == ele.topic
        }
        else if (selectLevel.value == ele.level && selectTopic.value == "all") {
            isFilter = true;
            return selectLevel.value == ele.level
        }
        else {
            isFilter = true
            return (selectLevel.value == ele.level && selectTopic.value == ele.topic);
        }
    })
    updateTable(filterArr)
}

function selectTopicOptions() {
    topicArr = ["all"]
    selectTopic.innerHTML = ""
    for (let i = 0; i < listArr.length; i++) {
        if (!(topicArr.includes(listArr[i].topic))) {
            topicArr.push(listArr[i].topic);
        }
    }
    for (let i = 0; i < topicArr.length; i++) {
        selectTopic.innerHTML += `<option class="selectTopicsValue" value="${topicArr[i].toLowerCase()}">${topicArr[i].toLowerCase()}</option>`
    }
    counting()
}
selectTopicOptions()

function counting() {
    countingArr = []
    for (let i = 1; i < topicArr.length; i++) {
        let topic = topicArr[i];
        let countingObj = {
            topic: topic,
            easyCount: 0,
            medCount: 0,
            diffCount: 0,
            easyCompleteCount: 0,
            medCompleteCount: 0,
            diffCompleteCount: 0
        }
        for (let j = 0; j < listArr.length; j++) {
            if (topic == listArr[j].topic) {
                if (listArr[j].level == "easy") {
                    ++countingObj.easyCount
                    if (listArr[j].complete) {
                        ++countingObj.easyCompleteCount
                    }
                }
                if (listArr[j].level == "medium") {
                    ++countingObj.medCount
                    if (listArr[j].complete) {
                        ++countingObj.medCompleteCount
                    }
                }
                if (listArr[j].level == "hard") {
                    ++countingObj.diffCount
                    if (listArr[j].complete) {
                        ++countingObj.diffCompleteCount
                    }
                }
            }
        }
        countingArr.push(countingObj)
    }
    updateSideBar()
    updateBgLevel()
}
counting()

function updateBgLevel() {
    let bgEasy = document.getElementById("bgEasy")
    let bgMed = document.getElementById("bgMed")
    let bgDiff = document.getElementById("bgDiff")

    let totalEasy = countingArr.reduce((acc, ele) => {
        return acc += ele.easyCount;
    }, 0)
    let totalEasyComplete = countingArr.reduce((acc, ele) => {
        return acc += ele.easyCompleteCount;
    }, 0)

    let totalMed = countingArr.reduce((acc, ele) => {
        return acc += ele.medCount;
    }, 0)
    let totalMedComplete = countingArr.reduce((acc, ele) => {
        return acc += ele.medCompleteCount;
    }, 0)

    let totalDiff = countingArr.reduce((acc, ele) => {
        return acc += ele.diffCount;
    }, 0)
    let totalDiffComplete = countingArr.reduce((acc, ele) => {
        return acc += ele.diffCompleteCount;
    }, 0)

    bgEasy.style.width = totalEasy == 0 ? "0%" : `${totalEasyComplete / totalEasy * 100}%`
    bgMed.style.width = totalMed == 0 ? "0%" : `${totalMedComplete / totalMed * 100}%`
    bgDiff.style.width = totalDiff == 0 ? "0%" : `${totalDiffComplete / totalDiff * 100}%`
}
updateBgLevel()

function updateSideBar() {
    let sideBarDetail = document.getElementById("sideBarDetail");
    sideBarDetail.innerHTML = ''
    if (countingArr.length != 0) {
        countingArr.forEach((ele) => {
            sideBarDetail.innerHTML +=
                `
                <details class="topics-graph" dir="ltr">
                    <summary>
                        <span class="topic-name">${ele.topic}</span>
                        <span class="topic-solv-ques">${ele.easyCompleteCount + ele.medCompleteCount + ele.diffCompleteCount}/${ele.easyCount + ele.medCount + ele.diffCount}</span>
                        <progress class="topic-progress" value="${ele.easyCompleteCount + ele.medCompleteCount + ele.diffCompleteCount}" max="${ele.easyCount + ele.medCount + ele.diffCount}"></progress>
                    </summary>
                    <section>
                        <div class="topic-level-graph easy-level-graph">
                            <span>Easy</span>
                            <span>${ele.easyCompleteCount}/${ele.easyCount}</span>
                            <progress class="level-progress easy-level-progress" value="${ele.easyCompleteCount}" max="${ele.easyCount}"></progress>
                        </div>
                        <div class="topic-level-graph mid-level-graph">
                            <span>Medium</span>
                            <span>${ele.medCompleteCount}/${ele.medCount}</span>
                            <progress class="level-progress mid-level-progress" value="${ele.medCompleteCount}" max="${ele.medCount}"></progress>
                        </div>
                        <div class="topic-level-graph diff-level-graph">
                            <span>Difficult</span>
                            <span>${ele.diffCompleteCount}/${ele.diffCount}</span>
                            <progress class="level-progress diff-level-progress" value="${ele.diffCompleteCount}" max="${ele.diffCount}"></progress>
                        </div>
                    </section>
                </details> 
                `
        })
    }
    else {
        sideBarDetail.innerHTML = `<span class="sideBar-no-data" dir="ltr">Nothing to show you</span>`
    }
}
updateSideBar()

function updateTable(arr) {
    tableWrapper.innerHTML = "";
    if (arr.length != 0) {
        tableWrapper.style.borderWidth = "1px 1px 0 1px";
        tableWrapper.innerHTML +=
            `
            <table>
                <thead>
                    <tr>
                        <th>Sr No</th>
                        <th>Status</th>
                        <th>Topics</th>
                        <th>Question</th>
                        <th>Level</th>
                        <th>Practise</th>
                        <th>Compaines</th>
                        <th>Update</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    ${arr.map((ele, idx) => {
                let links;
                if (ele.link.indexOf("leetcode") >= 0) {
                    links = `<a href="${ele.link}" target="_blank"><img src="./assets/leetcode.png" alt="img" /></a>`;
                }
                else if (ele.link.indexOf("geeksforgeeks") >= 0) {
                    links = `<a href="${ele.link}" target="_blank"><img src="./assets/gfg.png" alt="img" /></a>`;
                }
                else if (ele.link.indexOf("youtube") >= 0) {
                    links = `<a href="${ele.link}" target="_blank"><img src="./assets/youtube.png" alt="img" /></a>`;
                }
                else {
                    links = `<a href="${ele.link}" target="_blank"><i class="bi bi-link"></i></a>`;
                }
                return `
                        <tr>
                            <td>
                                ${isFilter ? idx + 1 : ele.id + 1}
                            </td>
                            <td>
                                <div class="td-checkbox">
                                    <input type="checkbox" name="checkbox" class="check-box" ${(ele.complete == true) ? "checked" : ""} onChange="toggleTaskComplete(${ele.id})"/>
                                </div>
                            </td>
                            <td>
                                ${ele.topic}
                            </td>
                            <td>
                                <div class="td-text">
                                    ${ele.question}
                                </div>
                            </td>
                            <td>
                                ${ele.level}
                            </td>
                            <td>
                                <div class="td-img">
                                    ${links}
                                </div>
                            </td>
                            <td>
                                <div class="td-text">
                                    ${ele.company}
                                </div>
                            </td>
                            <td>
                                <button type="button" class="edit-btn" onclick="updateList(${ele.id})"><i class="bi bi-pencil-square"></i></button>
                            </td>
                            <td>
                                <button type="button" class="del-btn" onclick="delList(${ele.id})"><i class="bi bi-trash3"></i></button>
                            </td>
                        </tr>
                        `
            }).join("")
            }
                </tbody>
            </table>
            `
    }

    else {
        tableWrapper.innerHTML = `<span class="no-data">No data to display</span>`;
        tableWrapper.style.borderWidth = "1px"
    }
}
updateTable(listArr);


const count = 500,
defaults = {
    origin: { y: 0.7 },
};

function fire(particleRatio, opts) {
    confetti(
        Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio),
        })
    );
}
