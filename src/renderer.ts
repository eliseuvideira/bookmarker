const linksSection = document.querySelector('.links');
const errorMessage = document.querySelector('.error-message');
const newLinkForm = document.querySelector('.new-link-form');
const newLinkUrl: any = document.querySelector('.new-link-url');
const newLinkSubmit: any = document.querySelector('.new-link-submit');
const clearStorageButton = document.querySelector('.clear-storage');

const parser = new DOMParser();
import { shell } from 'electron';

const parseResponse = (text: string) => {
  return parser.parseFromString(text, 'text/html');
};

const findTitle = (nodes: Document) => {
  const title = nodes.querySelector('title');
  if (!title) {
    throw new Error('title not found');
  }
  return title.innerText;
};

const storeLink = (title: string, url: string) => {
  localStorage.setItem(url, JSON.stringify({ title, url }));
};

const getLinks = () => {
  return Object.keys(localStorage).map((key) =>
    JSON.parse(localStorage.getItem(key)!),
  );
};

const convertToElement = (link: any) => {
  return `
    <div class="link">
      <h3>${link.title}</h3>
      <p>
        <a href="${link.url}">${link.url}</a>
      </p>
    </div>
  `;
};

const renderLinks = () => {
  const linkElements = getLinks()
    .map(convertToElement)
    .join('');
  linksSection!.innerHTML = linkElements;
};

const clearForm = () => {
  newLinkUrl.value = null;
};

const handleError = (error: Error, url: string) => {
  errorMessage!.innerHTML = `
    There was an issue adding "${url}": ${error.message}
  `.trim();
  setTimeout(() => (errorMessage!.textContent = null), 5000);
};

newLinkUrl!.addEventListener('keyup', () => {
  newLinkSubmit.disabled = !newLinkUrl.validity.valid;
});

newLinkForm!.addEventListener('submit', async (event) => {
  event.preventDefault();
  const url = newLinkUrl.value;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`
        Status code of ${response.status}
        ${response.statusText}
      `);
    }
    const data = await response.text();
    const doc = parseResponse(data);
    const title = findTitle(doc);
    storeLink(title, url);
    clearForm();
    renderLinks();
  } catch (err) {
    handleError(err, url);
  }
});

clearStorageButton!.addEventListener('click', () => {
  localStorage.clear();
  linksSection!.innerHTML = '';
});

linksSection!.addEventListener('click', (event: any) => {
  if (event.target.href) {
    event.preventDefault();
    shell.openExternal(event.target.href);
  }
});

renderLinks();
