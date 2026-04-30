let myLibrary = JSON.parse(localStorage.getItem('myOnLIBVault')) || [];
let profile = JSON.parse(localStorage.getItem('onLIBProfile')) || {
  name: 'New User',
  bio: '',
  pfp: ''
};

let currentEditingId = null;
let currentFolder = 'All';

/* PROFILE */
function initProfile(){
  document.getElementById('userName').value = profile.name;
  document.getElementById('userBio').value = profile.bio;
  if(profile.pfp) document.getElementById('pfpImg').src = profile.pfp;
}

function saveProfile(){
  profile.name = userName.value;
  profile.bio = userBio.value;
  localStorage.setItem('onLIBProfile', JSON.stringify(profile));
}

function uploadPFP(input){
  const reader = new FileReader();
  reader.onload = e => {
    profile.pfp = e.target.result;
    pfpImg.src = e.target.result;
    saveProfile();
  };
  reader.readAsDataURL(input.files[0]);
}

/* STORAGE */
function save(){
  localStorage.setItem('myOnLIBVault', JSON.stringify(myLibrary));
  renderLibrary();
}

/* SEARCH */
async function searchBooks(){
  const q = searchInput.value.trim();
  if(!q) return;

  searchSection.classList.remove('hidden');
  searchResults.innerHTML = "Loading...";

  const res = await fetch(`https://openlibrary.org/search.json?q=${q}&limit=10`);
  const data = await res.json();

  searchResults.innerHTML = "";

  data.docs.forEach(book => {
    const cover = book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
      : '';

    searchResults.innerHTML += `
      <div onclick="addBook('${book.key}','${cover}','${book.title}','${book.author_name?.[0] || ''}')"
      class="cursor-pointer">
        <img src="${cover}" class="rounded-xl"/>
        <p>${book.title}</p>
      </div>
    `;
  });
}

/* ADD BOOK */
async function addBook(key, cover, title, author){
  const work = await fetch(`https://openlibrary.org${key}.json`).then(r=>r.json());

  const newBook = {
    id: Date.now(),
    title,
    author,
    cover,
    desc: work.description?.value || work.description || '',
    tags: work.subjects?.slice(0,4) || [],
    pages: work.number_of_pages || 0,
    folder: 'Reading',
    rating: 5,
    notes: ''
  };

  myLibrary.push(newBook);
  save();
  openBook(newBook.id);
}

/* RENDER */
function renderLibrary(){
  const grid = libraryGrid;
  grid.innerHTML = "";

  const list = currentFolder === "All"
    ? myLibrary
    : myLibrary.filter(b => b.folder === currentFolder);

  list.forEach(b => {
    grid.innerHTML += `
      <div onclick="openBook(${b.id})">
        <img src="${b.cover}" />
        <p>${b.title}</p>
      </div>
    `;
  });
}

/* FOLDER */
function setFolder(f){
  currentFolder = f;
  folderTitle.innerText = f;
  renderLibrary();
}

/* MODAL */
function openBook(id){
  currentEditingId = id;
  const b = myLibrary.find(x => x.id === id);

  modalTitle.innerText = b.title;
  modalAuthor.innerText = b.author;
  modalDesc.innerText = b.desc;

  bookModal.classList.remove('hidden');
  bookModal.classList.add('flex');
}

function closeModal(){
  bookModal.classList.add('hidden');
}

/* RANDOM */
function rollRandom(){
  if(!myLibrary.length) return;
  openBook(myLibrary[Math.floor(Math.random()*myLibrary.length)].id);
}

/* INIT */
initProfile();
renderLibrary();
