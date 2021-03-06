import { writable } from 'svelte/store';
import { ET, E } from './enums';
import { Ws } from './ws_events_dispatcher';
import { style } from 'dynamic-import';
/**
 * currently not used this store anywhere and not using any css framework:
 * \todo fetch frameworks from server:
 */
export const css_frameworks = writable({
  bootstrap:
    '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">'
});
export const selected_frameworks = writable(['bootstrap']);

/**
 * Css store used to change class names of component.
 * it's used rarely when wanted to use custom css framework.
 */
export const css = writable({});

/**
 *
 * Manually Load css:
 *
 */

// https://github.com/pyrsmk/toast
// other good library: https://github.com/yefremov/loadcss
class Toast {
  /**
   * Load several resources from URLs
   *
   * @param {string[]} urls
   * @return {Promise<HTMLElement[]>}
   */
  public all(urls: string[]): Promise<HTMLElement[]> {
    return Promise.all(
      urls.map(
        (url): Promise<HTMLElement> => {
          switch (url.split('.').pop()!.toLowerCase()) {
            case 'css':
              return this.css(url);
            case 'js':
              return this.js(url);
            default:
              return Promise.reject(new Error(`Unable to detect extension of '${url}'`));
          }
        }
      )
    );
  }

  /**
   * Load a CSS URL
   *
   * @param {string} url
   * @return {Promise<HTMLElement>}
   */
  public css(url: string): Promise<HTMLElement> {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.querySelector('head')!.appendChild(link);
    return this.promise(link);
  }

  /**
   * Load a JS URL
   *
   * @param {string} url
   * @return {Promise<HTMLElement>}
   */
  public js(url: string): Promise<HTMLElement> {
    const script = document.createElement('script');
    script.src = url;
    document.querySelector('head')!.appendChild(script);
    return this.promise(script);
  }

  /**
   * Create a promise based on an HTMLElement
   * @param {HTMLElement} element
   * @return {Promise<HTMLElement>}
   */
  private promise(element: HTMLElement): Promise<HTMLElement> {
    return new Promise((resolve, reject): void => {
      element.addEventListener('load', (): void => {
        resolve(element);
      });
      element.addEventListener('error', (): void => {
        reject();
      });
    });
  }
}

const T = new Toast();

export const css_loading = writable(true);
let cssRaw = {};

let css_add_count = 0;
const css_count_ = { table: 0, normalize: 0, body: 1 };
const css_loaded = {};
export const css_count = {
  increase: (name) => {
    css_count_[name] = (css_count_[name] || 0) + 1;
    if (cssRaw[name] && !css_loaded[name]) {
      css_loading.set(true);
      ++css_add_count;
      //console.log('css_add ', css_add_count, cssRaw[name].link)
      T.css(cssRaw[name].link)
        .then(function () {
          --css_add_count;
          css_loaded[name] = true;
          //console.log('css_remove ', css_add_count, cssRaw[name].link)
          if (css_add_count == 0) css_loading.set(false);
          //console.log('css files have been loaded!', cssRaw[name].link)
        })
        .catch(function (reason) {
          --css_add_count;
          css_loaded[name] = false;
          if (css_add_count == 0) css_loading.set(false);
        });
    }
  },
  decrease: (name) => {
    setTimeout((_) => {
      css_count_[name] = css_count_[name] - 1;
      if (cssRaw[name] && css_count_[name] == 0) {
        css_loaded[name] = false;
        // note: not calling css_loading.set(true) because onDestory life cycle is called too late!
        const l = `head link[rel='stylesheet'][href='${cssRaw[name].link}']`;
        const link = document.querySelector(l);
        if (link) {
          link.remove();
        } else {
          console.log('link not found: ', l);
        }
      }
    }, 1000);
  },
  decreaseNow: (name) => {
    if (cssRaw[name]) {
      css_loaded[name] = false;
      // note: not calling css_loading.set(true) because onDestory life cycle is called too late!
      const l = `head link[rel='stylesheet'][href='${cssRaw[name].link}']`;
      const link = document.querySelector(l);
      if (link) {
        link.remove();
      } else {
        console.log('link not found: ', l);
      }
    }
  }
};

// {"table":{"classes":{},"link":"/table.5efd916f.css"}}
Ws.bind$(
  [ET.get, E.css_event, 0],
  function (data: { table: { link: '' } }) {
    css_loading.set(true);
    css.set(data);
    for (let [k, v] of Object.entries(data)) {
      if (cssRaw[k]?.link !== v.link) {
        if (css_count_[k] > 0) {
          if (cssRaw[k]?.link) {
            const l = `head link[rel='stylesheet'][href='${cssRaw[k].link}']`;
            const link = document.querySelector(l);
            if (link) {
              link.remove();
            } else {
              console.log('link not found: ', l);
            }
          }
        }
      }

      if (cssRaw[k]?.link !== v.link || !css_loaded[k]) {
        if (css_count_[k] > 0) {
          ++css_add_count;
          //console.log('css_add ', css_add_count, v.link)
          T.css(v.link)
            .then(function () {
              --css_add_count;
              css_loaded[k] = true;
              //console.log('css_remove ', css_add_count, v.link)
              if (css_add_count == 0) css_loading.set(false);
              //console.log('css files have been loaded when setting data!', v.link)
            })
            .catch(function (reason) {
              --css_add_count;
              css_loaded[k] = false;
              if (css_add_count == 0) css_loading.set(false);
            });
        }
      }
    }
    cssRaw = data;
  },
  1
);
