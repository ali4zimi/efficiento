const addToMarkerButton = document.getElementById('addToMarkerButton');

const markers = [];

loadMarkers();
// console.log(markers);

function loadMarkers() {
  chrome.storage.sync.get('markers', data => {
    if (data.markers) {
      markers.push(...data.markers);
    }
  });
}

// remove all markers
// chrome.storage.sync.set({ markers: [] });

addToMarkerButton.addEventListener('click', () => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    let url = tabs[0].url;
    let title = tabs[0].title || 'No Title';
    let icon = tabs[0].favIconUrl || 'No Icon';

    // if not null or undefined
    if (url) {
      const marker = {
        url: url,
        title: title,
        icon: icon
      };
      markers.push(marker);
      chrome.storage.sync.set({ markers: markers });
      window.close();
    } else {
      return;
    }

  });
});
