import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

const BASE_URL = 'https://pixabay.com/api';
const KEY = '35280209-56eb7ad4dfda02f9745c93fe7';

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

let page = 1;
let searchQuery = '';

refs.form.addEventListener('submit', onFormSubmit);

async function searchImages() {
  try {
    const response = await axios.get(`${BASE_URL}/?key=${KEY}&q=${encodeURIComponent(searchQuery)}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`);
    const data = response.data;
    const images = data.hits;
    const totalHits = data.totalHits;

    if (images.length === 0 && page === 1) {
      alertNoImagesFound();
    } else {
      const imageCards = images.map((image) => {
        const card = createImageCard(image);
        const link = document.createElement('a');
        link.href = image.largeImageURL;
        link.appendChild(card);
        return link;
      });

      imageCards.forEach((card) => {
        refs.gallery.appendChild(card);
      });

      const lightbox = new SimpleLightbox('.gallery a');
      lightbox.refresh();

      if (page === 1) {
        alertImagesFound(data);
      }
    }

    if (images.length === 0 || images.length >= totalHits) {
      refs.loadMoreBtn.style.display = 'none';
    } else {
      refs.loadMoreBtn.style.display = 'block';
    }
  } catch (error) {
    console.error(error);
  }
}

function createImageCard(image) {
  const card = document.createElement('div');
  card.classList.add('photo-card');

  const img = document.createElement('img');
  img.src = image.webformatURL;
  img.alt = image.tags;
  img.loading = 'lazy';
  card.appendChild(img);

  const info = document.createElement('div');
  info.classList.add('info');

  const likes = document.createElement('p');
  likes.classList.add('info-item');
  likes.innerHTML = `<b>Likes:</b> ${image.likes}`;
  info.appendChild(likes);

  const views = document.createElement('p');
  views.classList.add('info-item');
  views.innerHTML = `<b>Views:</b> ${image.views}`;
  info.appendChild(views);

  const comments = document.createElement('p');
  comments.classList.add('info-item');
  comments.innerHTML = `<b>Comments:</b> ${image.comments}`;
  info.appendChild(comments);

  const downloads = document.createElement('p');
  downloads.classList.add('info-item');
  downloads.innerHTML = `<b>Downloads:</b> ${image.downloads}`;
  info.appendChild(downloads);

  card.appendChild(info);

  return card;
}

function clearGallery() {
  refs.gallery.textContent = '';
}

function onFormSubmit(event) {
  event.preventDefault();
  searchQuery = refs.form.elements.searchQuery.value;

  if (searchQuery.trim() === '') {
    alertNoEmptySearch();
    return;
  }

  page = 1;
  clearGallery();
  searchImages();
}

function loadMoreImages() {
  page++;
  searchImages();
}

function checkScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight - cardHeight * 2 && refs.loadMoreBtn.style.display !== 'none') {
    loadMoreImages();
  } else if (scrollTop + clientHeight >= scrollHeight && refs.loadMoreBtn.style.display === 'none') {
    alertEndOfSearch();
  }
}

function alertImagesFound(data) {
  Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
}

function alertNoEmptySearch() {
  Notiflix.Notify.warning('The search string cannot be empty. Please specify your search query.');
}

function alertNoImagesFound() {
  Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
}

function alertEndOfSearch() {
  Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
}

refs.loadMoreBtn.style.display = 'none';

window.addEventListener('scroll', checkScroll);
