const createAlert = (alertList, message, buttonTypeClass) => {
  alertList.innerHTML = "";
  const alertDiv = document.createElement("div");
  alertDiv.className = buttonTypeClass;
  alertDiv.innerText = message;
  const closeButton = document.createElement("span");
  closeButton.className = `alert__closebtn`;
  closeButton.setAttribute(
    "onclick",
    "this.parentElement.style.display='none';"
  );
  closeButton.innerHTML = " &times";
  alertDiv.appendChild(closeButton);
  alertList.appendChild(alertDiv);
};

async function postData(url = "", data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    redirect: "follow", // manual, *follow, error
    referrer: "no-referrer", // no-referrer, *client
    body: data // body data type must match "Content-Type" header
  });
  // console.log(response);
  return await response.json(); // parses JSON response into native JavaScript objects
}

const createformSubmit = async function(e, form, quill, path) {
  e.preventDefault();
  const formData = new FormData(form);
  // Populate hidden text form on submit with HTML instead of text
  console.log(quill.root.innerHTML);
  formData.append("postText", quill.root.innerHTML);
  const alertList = document.getElementsByClassName("alert-list")[0];
  const response = await postData(path, formData);
  if (response.status === "error") {
    createAlert(alertList, response.message, "alert--wrong");
  } else {
    window.location.href = "/";
  }
};

const editFormSubmit = async function(e, form, quill, path) {
  e.preventDefault();
  const formData = new FormData(form);
  const postId = document.getElementById("post-id").innerText;
  // Populate hidden text form on submit with HTML instead of text
  console.log(quill.root.innerHTML);
  formData.append("postText", quill.root.innerHTML);
  formData.append("postId", postId);
  const alertList = document.getElementsByClassName("alert-list")[0];
  const response = await postData(path, formData);
  const postTextEditor = document.getElementById("post-text");
  console.log(response);
  if (response.status === "error") {
    createAlert(alertList, response.message, "alert");
  } else {
    postTextEditor.innerHTML = "";
    postTextEditor.innerHTML = response.postText;
    // Create edit button
    const editButton = document.createElement("button");
    editButton.id = "edit";
    editButton.onclick = function(event) {
      editPost(event);
    };
    editButton.innerText = "Edit";
    // attach edit button to button panel
    const buttonPanel = document.getElementById("button-panel");
    buttonPanel.innerHTML = "";
    buttonPanel.appendChild(editButton);
  }
};

class Editor {
  constructor(quillInstance, formDiv) {
    this.quill = quillInstance;
    this.form = formDiv;
  }

  async submitEditorValues(e, quill) {
    e.preventDefault();
  }
}
