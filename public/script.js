const api = "/notes";

/* FETCH NOTES */
async function fetchNotes() {
  try {
    const response = await fetch(api);
    const notes = await response.json();

    const notesList = document.getElementById("notesList");
    const notesCount = document.getElementById("notesCount");
    
    notesList.innerHTML = "";

    if (notes.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "empty-notes";
      emptyMessage.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-feather-alt"></i>
          <h3 class="mt-3">No notes yet</h3>
          <p class="text-muted">Create your first beautiful note above! 🎨</p>
        </div>
      `;
      notesList.appendChild(emptyMessage);
      notesCount.innerHTML = `<i class="fas fa-chart-simple me-1"></i>0 notes`;
      return;
    }

    notesCount.innerHTML = `<i class="fas fa-chart-simple me-1"></i>${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`;

    notes.forEach((note, index) => {
      const li = document.createElement("li");
      const safeTitle = escapeHtml(note.title);
      const safeText = escapeHtml(note.text);
      
      li.style.animationDelay = `${index * 0.05}s`;
      
      li.innerHTML = `
        <div class="note-content">
          <strong><i class="fas fa-tag me-2"></i>${safeTitle}</strong>
          <p><i class="fas fa-quote-left me-2 opacity-50"></i>${safeText}</p>
        </div>
        <div class="note-actions">
          <button class="edit-btn" onclick="openEditPopup('${note._id}', \`${escapeHtml(note.title)}\`, \`${escapeHtml(note.text)}\`)">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="delete-btn" onclick="deleteNote('${note._id}')">
            <i class="fas fa-trash-alt"></i> Delete
          </button>
        </div>
      `;
      notesList.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    showMessage("Failed to load notes", "error");
  }
}

/* Helper function to escape HTML */
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/`/g, "&#96;");
}

/* ADD NOTE */
async function addNote() {
  const titleInput = document.getElementById("noteTitle");
  const textInput = document.getElementById("noteInput");

  if (titleInput.value.trim() === "" || textInput.value.trim() === "") {
    showMessage("Please fill in both title and note fields", "warning");
    titleInput.classList.add('shake');
    textInput.classList.add('shake');
    setTimeout(() => {
      titleInput.classList.remove('shake');
      textInput.classList.remove('shake');
    }, 500);
    return;
  }

  try {
    await fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: titleInput.value.trim(),
        text: textInput.value.trim(),
      }),
    });

    titleInput.value = "";
    textInput.value = "";

    showMessage("Note Added Successfully!", "success", "Your note has been saved");
    fetchNotes();
  } catch (error) {
    console.error("Error adding note:", error);
    showMessage("Failed to add note", "error");
  }
}

/* UPDATE NOTE */
async function updateNote(id) {
  const newTitle = document.getElementById("editTitle");
  const newText = document.getElementById("editInput");

  if (!newTitle || !newText) return;

  if (newTitle.value.trim() === "" || newText.value.trim() === "") {
    showMessage("Please fill in both fields", "warning");
    return;
  }

  try {
    await fetch(`${api}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newTitle.value.trim(),
        text: newText.value.trim(),
      }),
    });

    closePopup();
    showMessage("Note Updated Successfully!", "success", "Your changes have been saved");
    fetchNotes();
  } catch (error) {
    console.error("Error updating note:", error);
    showMessage("Failed to update note", "error");
  }
}

/* OPEN POPUP */
function openEditPopup(id, oldTitle, oldText) {
  closePopup();

  const popup = document.createElement("div");
  popup.className = "popup-overlay";
  popup.id = "popup";
  
  const safeTitle = escapeHtml(oldTitle);
  const safeText = escapeHtml(oldText);
  
  popup.innerHTML = `
    <div class="popup-box">
      <h2>
        <i class="fas fa-pen text-warning"></i>
        Edit Your Note
      </h2>
      <input type="text" id="editTitle" value="${safeTitle}" placeholder="Note title" />
      <textarea id="editInput" placeholder="Write your note..." rows="4">${safeText}</textarea>
      <div class="popup-buttons">
        <button class="save-btn" onclick="updateNote('${id}')">
          <i class="fas fa-save me-2"></i>Save Changes
        </button>
        <button class="cancel-btn" onclick="closePopup()">
          <i class="fas fa-times me-2"></i>Cancel
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      closePopup();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
  
  setTimeout(() => {
    const titleInput = document.getElementById("editTitle");
    if (titleInput) titleInput.focus();
  }, 100);
}

/* DELETE NOTE */
async function deleteNote(id) {
  if (confirm("Are you sure you want to delete this note? 🗑️")) {
    try {
      await fetch(`${api}/${id}`, {
        method: "DELETE",
      });
      showMessage("Note Deleted Successfully!", "success", "The note has been removed");
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      showMessage("Failed to delete note", "error");
    }
  }
}

/* IMPRESSIVE TOAST MESSAGE */
function showMessage(message, type = "success", subtitle = "") {
  const existingMsg = document.querySelector(".toast-message");
  if (existingMsg) existingMsg.remove();

  const msg = document.createElement("div");
  msg.className = `toast-message ${type}`;
  
  let icon = "✅";
  let title = "Success!";
  
  if (type === "success") {
    icon = "🎉";
    title = "Success!";
    subtitle = subtitle || "Operation completed successfully";
  } else if (type === "error") {
    icon = "❌";
    title = "Error!";
    subtitle = subtitle || "Something went wrong";
  } else if (type === "warning") {
    icon = "⚠️";
    title = "Warning!";
    subtitle = subtitle || "Please check your input";
  }
  
  msg.innerHTML = `
    <div class="toast-content">
      <div class="toast-icon">${icon}</div>
      <div class="toast-text">
        <div class="toast-title">${title}</div>
        <div class="toast-message-text">${message}</div>
        ${subtitle ? `<div style="font-size: 0.75rem; margin-top: 4px; opacity: 0.7;">${subtitle}</div>` : ''}
      </div>
    </div>
    <div class="toast-progress">
      <div class="toast-progress-bar"></div>
    </div>
  `;
  
  document.body.appendChild(msg);

  setTimeout(() => {
    msg.style.animation = "slideInRight 0.3s ease-out reverse";
    setTimeout(() => msg.remove(), 300);
  }, 3000);
}

/* CLOSE POPUP */
function closePopup() {
  const popup = document.getElementById("popup");
  if (popup) {
    popup.style.animation = "fadeOut 0.2s ease-out";
    setTimeout(() => popup.remove(), 200);
  }
}

/* Add animations CSS dynamically */
const style = document.createElement('style');
style.textContent = `
  .shake {
    animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(style);

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  fetchNotes();
  
  const textInput = document.getElementById("noteInput");
  if (textInput) {
    textInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        addNote();
      }
    });
  }
});