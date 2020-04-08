export function load() {

  let componentName = 'leaflet-root';
  let count = -1;
  let id_prefix = componentName + '-';

  customElements.define(componentName, class leaflet_root extends HTMLElement {
    constructor() {
      super();

      count++;
      let id = id_prefix + count;

      const html = `
<div id="${id}" style="height: 180px;"></div>
      `;

      this.html = `${html}`;
    }

    setState(state) {
      if (state.name) {
        this.name = state.name;
      }
      if (state.height) {
        this.rootElement.setAttribute('style', 'height: ' + state.height + ';');
      }
      if (state.accessToken) {
        this.accessToken = state.accessToken;
      }
    }

    onLoaded() {
      this.readyEvent = new Event('mapReady');
      let _this = this;
      let prefix = '';
      if (this.context.leafletResourcePath) prefix = this.context.leafletResourcePath;

      this.loadCSSFile(prefix + 'css/leaflet.css', function() {
        _this.loadJSFile(prefix + 'js/leaflet.js', function() {
          _this.leaflet = L;
          _this.isReady();
        });
      });
    }

    renderMap(lat, long, zoom) {
      let _this = this;
      let fn = function() {
        let map = _this.leaflet.map(_this.rootElement.id).setView([lat, long], zoom);
        _this.leaflet.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: 'mapbox/streets-v11',
          tileSize: 512,
          zoomOffset: -1,
          accessToken: _this.accessToken
        }).addTo(map);
      }
      if (this.ready) {
         fn();
      }
      else {
        this.onReady(fn);
      }
    }

    onReady(fn) {
      document.addEventListener('mapReady', fn);
    }

    isReady() {
      if (this.readyEvent) {
        document.dispatchEvent(this.readyEvent);
      }
      this.ready = true;
    }

    connectedCallback() {
      this.innerHTML = this.html;
      this.rootElement = this.getElementsByTagName('div')[0];
      this.childrenTarget = this.rootElement;
      this.name = componentName + '-' + count;
    }

    disconnectedCallback() {
      if (this.onUnload) this.onUnload();
    }

  });
};
