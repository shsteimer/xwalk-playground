import { loadFragment } from '../fragment/fragment.js';

const FIELDS = {
  backgroundType: {
    defaultValue: 'image',
  },
  title: {},
  titleFont: {
    defaultValue: 'Roboto',
  },
  description: {
    get: (child) => child.children[0],
  },
  titleSize: {
    defaultValue: 'large',
  },
  offsetContent: {
    defaultValue: false,
    get: (child) => child.textContent.trim() === 'true',
  },
  backgroundImage: {
    get: (child) => child.querySelector('picture'),
  },
  imageAlt: {
    defaultValue: '',
  },
  video: {},
  icon: {
    get: (child) => child.querySelector('picture'),
  },
  iconAlt: {},
  textColor: {
    defaultValue: 'white',
  },
  ctaNumber: {
    get: (child) => {
      const text = child.textContent.trim();
      return text === 'two' ? 2 : 1;
    },
    defaultValue: 1,
  },
  cta1Style: {
    defaultValue: 'primary',
  },
  cta1Label: {
    defaultValue: 'CTA 1',
  },
  cta1Type: {
    defaultValue: 'link',
  },
  cta1Link: {},
  cta1Asset: {},
  cta1AriaLabel: {
    defaultValue: '',
  },
  cta1Target: {
    defaultValue: 'sameTab',
  },
  exitInterstitial1: {
  },
  cta2Style: {
    defaultValue: 'secondary',
  },
  cta2Label: {
    defaultValue: 'CTA 2',
  },
  cta2Type: {
    defaultValue: 'link',
  },
  cta2Link: {},
  cta2Asset: {},
  cta2AriaLabel: {
    defaultValue: '',
  },
  cta2Target: {
    defaultValue: 'sameTab',
  },
  exitInterstitial2: {},
};

function setClasses(block, config) {
  const {
    backgroundType,
    titleFont,
    titleSize,
    textColor,
    offsetContent,
  } = config;
  block.classList.add(`hero-${backgroundType}`);
  block.classList.add(`hero-title-${titleFont}`);
  block.classList.add(`hero-title-${titleSize}`);
  block.classList.add(`hero-text-${textColor}`);
  if (offsetContent) {
    block.classList.add('hero-offset-content');
  }
}

function buildCta(config, index) {
  const style = config[`cta${index + 1}Style`];
  const label = config[`cta${index + 1}Label`];
  const type = config[`cta${index + 1}Type`];
  const ariaLabel = config[`cta${index + 1}AriaLabel`];
  const target = config[`cta${index + 1}Target`];

  const ctaWrapper = document.createElement('p');
  ctaWrapper.classList.add('button-wrapper');
  const cta = document.createElement('a');
  cta.classList.add('button');
  cta.classList.add(style);
  if (target === 'newTab') cta.setAttribute('target', '_blank');
  cta.setAttribute('aria-label', ariaLabel);

  if (type === 'asset') {
    const asset = config[`cta${index + 1}Asset`];
    cta.setAttribute('target', '_blank');
    cta.href = asset;
  } else {
    const exitInterstitial = config[`exitInterstitial${index + 1}`];
    const link = config[`cta${index + 1}Link`];
    cta.href = link;
    if (exitInterstitial) {
      cta.addEventListener('click', (e) => {
        e.preventDefault();
        const dlg = document.createElement('dialog');

        const fragment = loadFragment(`/fragments/modals/${exitInterstitial}`);
        dlg.appendChild(fragment);
        document.body.appendChild(dlg);
        dlg.showModal();
      });
    }
  }

  cta.textContent = label;
  ctaWrapper.appendChild(cta);
  return ctaWrapper;
}

function renderBlock(config) {
  const background = document.createElement('div');
  background.classList.add('hero-background');

  if (config.backgroundType === 'image') {
    const { backgroundImage, imageAlt } = config;
    if (backgroundImage) {
      background.appendChild(backgroundImage);
      if (backgroundImage.querySelector('img') && imageAlt) {
        backgroundImage.querySelector('img').setAttribute('alt', imageAlt);
      }
    }
  } else {
    const { video } = config;
    if (video) {
      background.appendChild(video);
    }
  }

  const content = document.createElement('div');
  content.classList.add('hero-content');

  const titleWrapper = document.createElement('div');
  titleWrapper.classList.add('hero-title-wrapper');
  content.appendChild(titleWrapper);
  if (config.icon) {
    titleWrapper.appendChild(config.icon);
  }

  const title = document.createElement('h1');
  title.textContent = config.title;
  titleWrapper.appendChild(title);

  config.description.classList.add('hero-description');
  content.appendChild(config.description);

  const ctas = document.createElement('div');
  ctas.classList.add('hero-ctas');
  content.appendChild(ctas);
  for (let i = 0; i < config.ctaNumber; i += 1) {
    const cta = buildCta(config, i);
    ctas.appendChild(cta);
  }

  return [background, content];
}

export default async function decorate(block) {
  const config = {};
  const children = [...block.children];
  Object.entries(FIELDS).forEach(([key, field], index) => {
    const child = children[index];
    const getter = field.get;
    const value = getter ? getter(child) : child?.textContent?.trim() || field.defaultValue;
    config[key] = value;
  });

  setClasses(block, config);
  block.replaceChildren(...renderBlock(config));
}
