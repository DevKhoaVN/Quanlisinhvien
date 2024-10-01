var StudentAPI = "http://localhost:3000/students";
let currentStudentId = null; // Biến để lưu ID sinh viên hiện tại

function start() {
  getListStudent(renderHandleStudent);
}

start();

function getListStudent(callback) {
  fetch(StudentAPI)
    .then((response) => response.json())
    .then(callback);
}

function renderHandleStudent(students) {
  var renderStudent = document.querySelector("#student-display");
  renderStudent.innerHTML = ""; // Xóa nội dung cũ trước khi thêm mới

  students.forEach((student) => {
    html = `
      <tr class = student-id-${student.id}>
      <td>${student.id}</td>
        <td>${student.name}</td>
        <td>${student.age}</td>
        <td>${student.class}</td>
        <td>${student.school}</td>
        <td>${student.math}</td>
        <td>${student.lecture}</td>
        <td>${student.english}</td>
        <td> ${((student.math + student.english + student.lecture) / 3).toFixed(
          2
        )} </td>
        <td>
          <button onclick="openEditPopup(${
            student.id
          })" style = "background-color:blue; font-size : 1.5rem ;margin-left:10px"><i class="fa-solid fa-pen-to-square"></i> Sửa</button>
          <button onclick="deleteStudent(${
            student.id
          })" style = "background-color:red; font-size : 1.5rem ;margin-left:30px""><i class="fa-solid fa-trash"></i> Xóa</button>
        </td>
      </tr>
    `;
    renderStudent.innerHTML += html;
  });
}
document.querySelector("#student-form").addEventListener("submit", addStudent); // callback add Student

function addStudent(event) {
  event.preventDefault(); // Ngăn chặn form gửi mặc định

  var isCheck = true;

  // Lấy các giá trị từ form
  var name = document.querySelector("#name").value.trim();
  var age = document.querySelector("#age").value.trim();

  // Reset lỗi cũ
  document.querySelector(".name_error").innerText = "";
  document.querySelector(".age_error").innerText = "";

  // Kiểm tra tên (ít nhất 8 kí tự)
  if (name.length < 8) {
    document.querySelector(".name_error").innerText =
      "Tên phải có ít nhất 8 kí tự.";

    console.log("Tên phải có ít nhất 8 kí tự.");
    isCheck = false;
  }

  // Kiểm tra độ tuổi hợp lệ (tuổi sinh viên phổ biến từ 18 đến 30)
  if (isNaN(age) || age < 18 || age > 30) {
    document.querySelector(".age_error").innerText =
      "Tuổi của bạn không hợp lệ (18-30).";

    console.log("yuoiphải có ít nhất 8 kí tự.");
    isCheck = false;
  }

  // Nếu kiểm tra thành công, gửi dữ liệu
  if (isCheck) {
    var newStudent = {
      name: name,
      age: parseInt(age),
      class: document.querySelector("#class").value,
      school: document.querySelector("#school").value,
      math: parseInt(document.querySelector("#math").value),
      english: parseInt(document.querySelector("#english").value),
      lecture: parseInt(document.querySelector("#lecture").value),
    };

    // Gửi dữ liệu qua HTTP POS
    fetch(`${StudentAPI}`, {
      // Thay 'API_URL' bằng đường dẫn API của bạn
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newStudent),
    })
      .then((response) => response.json())
      .then((resultData) => {
        console.log("Dữ liệu đã gửi thành công:", resultData);
        getListStudent(renderHandleStudent);
        // Xử lý khi dữ liệu thành công
      });
  }
}
function openEditPopup(id) {
  currentStudentId = id; // Lưu ID sinh viên hiện tại

  document.getElementById("edit-popup").style.display = "block"; // Hiện popup
}

function closePopup() {
  document.getElementById("edit-popup").style.display = "none"; // Ẩn popup
}

function saveEdit() {
  var updatedStudent = {
    name: document.querySelector("#edit-name").value,
    age: parseInt(document.querySelector("#edit-age").value), // Chuyển đổi thành số
    class: document.querySelector("#edit-class").value,
    school: document.querySelector("#edit-school").value,
    math: document.querySelector("#edit-math").value,
    english: document.querySelector("#edit-english").value,
    lecture: document.querySelector("#edit-lecture").value,
  };

  fetch(`${StudentAPI}/${currentStudentId}`, {
    method: "PUT", // hoặc PATCH
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedStudent),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Có lỗi xảy ra khi lưu thông tin.");
      }
      return response.json();
    })
    .then(() => {
      closePopup(); // Đóng popup
      getListStudent(renderHandleStudent); // Tải lại danh sách sinh viên
    })
    .catch((error) => console.error("Có lỗi xảy ra:", error));
}

function deleteStudent(id) {
  fetch(`${StudentAPI}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then(() => {
      var deleteStudent = document.querySelector(`.student-id-${id}`);
      deleteStudent.remove();
    });
}
function searchStudent() {
  const searchTerm = document.getElementById("search").value.trim(); // Dùng trim để loại bỏ khoảng trắng
  console.log("Searching for:", searchTerm); // In ra giá trị tìm kiếm

  // Kiểm tra nếu searchTerm không rỗng
  if (searchTerm === "") {
    console.log("Vui lòng nhập tên sinh viên để tìm kiếm.");
    getListStudent(renderHandleStudent);
    return;
  }

  fetch(StudentAPI)
    .then((response) => response.json())
    .then((students) => {
      var filterStudent = students.filter((student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log(filterStudent);
      renderHandleStudent(filterStudent);
    })
    .catch((error) => console.error("Error:", error));
}

function sortAverageScore() {
  getListStudent((students) => {
    var result = students.sort((a, b) => {
      // Tính điểm trung bình của từng sinh viên
      const avgA = ((a.math + a.english + a.lecture) / 3).toFixed(2);
      const avgB = ((b.math + b.english + b.lecture) / 3).toFixed(2);

      // Sắp xếp theo điểm trung bình giảm dần
      return avgB - avgA;
    });

    console.log(result);
    renderHandleStudent(result); // Hiển thị danh sách sinh viên sau khi sắp xếp
  });
}
