import { loadFragment } from '../fragment/fragment.js';

function processCtas(ctas) {
  ctas.forEach((cta) => {
    const url = new URL(cta.href);
    const path = url.pathname;
    const isAsset = path.includes('.pdf') || path.includes('.jpg') || path.includes('.jpeg') || path.includes('.png');
    if (isAsset) {
      cta.setAttribute('target', '_blank');
    } else if (url.hostname !== window.location.hostname) {
      cta.setAttribute('target', '_blank');
      cta.addEventListener('click', (e) => {
        e.preventDefault();
        const dlg = document.createElement('dialog');

        let exitInterstitial = 'third-parties';
        const altBrands = ['subbrand.brand.com', 'www.other-brand.com'];
        const account = ['account.brand.com'];
        if (altBrands.includes(url.hostname)) {
          exitInterstitial = 'alt-brand';
        } else if (account.includes(url.hostname)) {
          exitInterstitial = 'account';
        }
        loadFragment(`/fragments/modals/${exitInterstitial}`).then((fragment) => {
          if (fragment) {
            dlg.appendChild(fragment);
            document.body.appendChild(dlg);
            dlg.showModal();
          }
        });
      });
    }
  });
}

export default async function decorate(block) {
  const [content, background, cta1, cta2] = block.children;

  background.classList.add('hero-background');
  content.classList.add('hero-content');

  if (block.classList.contains('video')) {
    const videoLink = background.querySelector('a');
    const video = document.createElement('video');
    video.src = videoLink.href;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.controls = false;
    videoLink.replaceWith(video);
  }

  const titleWrapper = document.createElement('div');
  titleWrapper.classList.add('hero-title-wrapper');
  content.prepend(titleWrapper);

  const icon = content.querySelector('picture');
  if (icon) {
    titleWrapper.appendChild(icon);
  }

  const title = content.querySelector('h1');
  titleWrapper.appendChild(title);

  titleWrapper.nextElementSibling.classList.add('hero-description');

  if (cta1) {
    const ctas = document.createElement('div');
    ctas.classList.add('hero-ctas');
    cta1.before(ctas);
    ctas.appendChild(cta1);

    const cta1Container = cta1.querySelector('.button-container');
    cta1.replaceChildren(cta1Container);

    if (cta2) {
      ctas.appendChild(cta2);
    }

    processCtas(cta1.querySelectorAll('a'));
  }
}
