document.addEventListener("click", (e) => {
    let sections_table = document.getElementsByTagName("table")[0]
    let add_edit_table = document.getElementsByTagName("table")[1]
    if (e.target.tagName !== "BUTTON" /*|| !e.target.closest("#calculate-button")*/) {
        return
    }
    else if (e.target.closest(".edit-button")) {
        if (document.getElementById('required-grade')) { document.getElementById('required-grade').remove() }
        document.getElementsByTagName("h2")[0].innerHTML = "Edit Section"
        add_edit_table.rows[0].cells[3].innerHTML = "Update"
        add_edit_table.rows[1].cells[3].innerHTML = "<button class=\"update-button\" id=\"update-button\">Update</button>"
        let old_row = sections_table.rows[e.target.closest('tr').rowIndex]
        //alert(old_row.cells[0].innerText)
        document.getElementById("section-name-input").value = old_row.cells[0].innerText
        document.getElementById("percentage-weight-input").value = old_row.cells[1].innerText
        document.getElementById("current-grade-input").value = old_row.cells[2].innerText
        function click_update_wrapper(f) {
            click_update(f, old_row, add_edit_table, click_update_wrapper)
        }
        document.addEventListener("click", click_update_wrapper)
    }
    else if (e.target.closest(".remove-button")) //"Remove" button
    {
        //table.deleteRow(table.rows.length - 1)
        //alert(table.rows.length)
        //console.log(e.target.closest('tr').rowIndex)
        if (document.getElementById('required-grade')) { document.getElementById('required-grade').remove() }
        sections_table.deleteRow(e.target.closest('tr').rowIndex)
    }
    else if (e.target.closest(".add-button")) //"Add" button
    {
        if (document.getElementById('required-grade')) { document.getElementById('required-grade').remove() }
        const section_name = document.getElementById("section-name-input").value
        const percent_weight = document.getElementById("percentage-weight-input").value
        const current_grade = document.getElementById("current-grade-input").value
        if (!(section_name && percent_weight)) {
            alert("Make sure to fill in the section name and percent weight before adding a new section.")
            return
        }
        //TODO: Move input validation to here from calculate button
        //let percent_weight = document.getElementById("section-name-input").value
        let new_row = sections_table.insertRow(sections_table.rows.length);
        let name_cell = new_row.insertCell(0)
        name_cell.innerHTML = section_name
        let percent_cell = new_row.insertCell(1)
        percent_cell.innerHTML = percent_weight
        let grade_cell = new_row.insertCell(2)
        grade_cell.innerHTML = current_grade
        let edit_cell = new_row.insertCell(3)
        edit_cell.innerHTML = "<button class=\"edit-button\">Edit</button>"
        let remove_cell = new_row.insertCell(4)
        remove_cell.innerHTML = "<button class=\"remove-button\">Remove</button>"
        document.getElementById("section-name-input").value = ""
        document.getElementById("percentage-weight-input").value = ""
        document.getElementById("current-grade-input").value = ""
        // let cells_list = [];
        // for (let i = 0; i < 5; i++) {
        //   cells_list[i] = new_row.insertCell(i);
        //   cells_list[i].innerHTML = "Cell numero " + i;
        // }
        // cells_list[4].innerHTML = "<button>bruh</button>"
        //console.log(e.target)
        //console.log(document.getElementById("calculate-button"))
        //alert(e.target === document.getElementById("calculate-button"))
        //this approach actually works! e.target stores the DOM object that was clicked on.
    }
    else if (e.target.closest("#calculate-button")) {
        if (document.getElementById('required-grade')) { document.getElementById('required-grade').remove() }
        let desired_grade = document.getElementById("final-grade-input").value
        if (!desired_grade) {
            alert("Need to specify a desired grade.")
            return
        }
        //TODO: I think this leads to dividing by zero. if it doesn't, you can remove this.
        else if (desired_grade === 0)
        {
            alert("Can't have a desired final grade of 0!")
            return
        }
        let grades_list = []
        for (let i = 1; i < sections_table.rows.length; i++) { //skip header
            //keep in mind that the grade field is empty for the section whose required grade we are finding
            if (!parseInt(sections_table.rows[i].cells[1].innerText) && sections_table.rows[i].cells[1].innerText !== "0") { //if percent weight isn't numerical
                alert("Error: Percent weight for " + sections_table.rows[i].cells[0].innerText + " doesn't contain a number.")
                return
            }
            //TODO: Not sure how this works with if the cell contains 0.0...
            else if (sections_table.rows[i].cells[2].innerText && sections_table.rows[i].cells[2].innerText !== "0" && !parseFloat(sections_table.rows[i].cells[2].innerText)) { //if grade is non-empty and isn't numerical
                alert("Error: non-empty grade for " + sections_table.rows[i].cells[0].innerText + " doesn't contain a number.")
                return
            }
            let curr_grade = new Grade(sections_table.rows[i].cells[0].innerText, parseInt(sections_table.rows[i].cells[1].innerText), parseFloat(sections_table.rows[i].cells[2].innerText))
            grades_list.push(curr_grade)
        }
        let total_weight = 0
        let num_empty_grades = 0
        let empty_grade_index = -1
        for (let i = 0; i < grades_list.length; i++) {
            total_weight += grades_list[i].percent_weight
            if (!grades_list[i].current_grade && grades_list[i].current_grade !== 0) {
                num_empty_grades++
                empty_grade_index = i
            }
        }
        if (num_empty_grades !== 1)
        {
            alert("Error: Must have exactly one section with an empty grade.")
            return
        }
        if (total_weight !== 100)
        {
            alert("Error: Section weights must add up to 100%.")
            return
        }
        desired_grade = BigNumber(desired_grade)
        for (let i = 0; i < grades_list.length; i++) {
            if (i === empty_grade_index) {
                continue
            }
            else {
                desired_grade = desired_grade.minus(BigNumber(grades_list[i].percent_weight / 100).multipliedBy(BigNumber(grades_list[i].current_grade)))
            }
        }
        let missing_grade = desired_grade.dividedBy(BigNumber(grades_list[empty_grade_index].percent_weight / 100)).toNumber()
        //alert("The grade you need to achieve a final score of " + document.getElementById("final-grade-input").value + " in the section named " + grades_list[empty_grade_index].section_name + " is " + missing_grade)
        let p = document.createElement('h2')
        let node = document.createTextNode("Required Grade for " + grades_list[empty_grade_index].section_name + ": " + missing_grade)
        p.appendChild(node)
        document.getElementById('body').appendChild(p)
        p.id = 'required-grade'

    }
});
function click_update(f, old_row, add_edit_table, click_update_wrapper) {
    if (f.target.tagName !== "BUTTON") {
        return
    }
    if (f.target.closest('tr') === document.getElementById("new-section-input-row")) {
        const section_name = document.getElementById("section-name-input").value
        const percent_weight = document.getElementById("percentage-weight-input").value
        const current_grade = document.getElementById("current-grade-input").value
        if (!(section_name && percent_weight)) {
            alert("Make sure to fill in the section name and percent weight before adding a new section.")
            return
        }
        old_row.cells[0].innerText = document.getElementById("section-name-input").value
        old_row.cells[1].innerText = document.getElementById("percentage-weight-input").value
        old_row.cells[2].innerText = document.getElementById("current-grade-input").value
        document.getElementById("section-name-input").value = ""
        document.getElementById("percentage-weight-input").value = ""
        document.getElementById("current-grade-input").value = ""
        document.getElementsByTagName("h2")[0].innerHTML = "Add New Section"
        add_edit_table.rows[0].cells[3].innerHTML = "Add"
        add_edit_table.rows[1].cells[3].innerHTML = "<button class=\"add-button\" id=\"add-button\">Add</button>"
        document.removeEventListener("click", click_update_wrapper)
    }
}