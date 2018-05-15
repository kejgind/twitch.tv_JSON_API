// twitch.tv JSON API

const clientIdURL = 'scripts/clientID.json';

const twitchUsersURL = 'https://api.twitch.tv/kraken/users?login=';
const twitchStreamsURL = 'https://api.twitch.tv/kraken/streams/';

const twitchUsers = [
  'freecodecamp',
  'ThijsHS',
  'Swifty',
  'KidKerrigan',
  'ESL_SC2',
  'AmazHS',
  'Firebat',
  'armatvhs'
];

// Get clientID to connetct to twitch API
const getClientId = new Promise((resolve, reject) => {
  fetch(clientIdURL)
    .then(resolve => resolve.json())
    .then(data => resolve(data.clientID))
    .catch(error => reject(error));
});

// Get specified in 'twitchUsers' twitch users data
const getTwitchUsers = (clientId, twitchUser) => {
  return new Promise((resolve, reject) => {
    fetch(`${twitchUsersURL}${twitchUser}`, {
      headers: {
        Accept: 'application/vnd.twitchtv.v5+json',
        'Client-ID': clientId
      }
    })
      .then(resolve => resolve.json())
      .then(data => resolve(data))
      .catch(error => reject(error));
  });
};

// Check which users are currently streaming
const checkTwitchUserStreams = (twitchUserId, clientId) => {
  return new Promise((resolve, reject) => {
    fetch(`${twitchStreamsURL}${twitchUserId}`, {
      headers: {
        Accept: 'application/vnd.twitchtv.v5+json',
        'Client-ID': clientId
      }
    })
      .then(resolve => resolve.json())
      .then(data => resolve(data))
      .catch(error => reject(error));
  });
};

// UI - display channels
const displayChanells = element => {
  const channelName = element[0].display_name;
  const channelBio = element[0].bio;
  const channelLogo = element[0].logo;
  const channelID = element[0]._id;

  let appendHTML = document.createElement('div');
  appendHTML.id = channelID;
  appendHTML.className = 'channel offline';
  appendHTML.innerHTML = `
    <img class='channel-logo' src='${channelLogo}' alt='${channelName}' />
    <div class='channel-info'>
      <h2 class='channel-name'>${channelName}</h2>
      <p class='channel-bio'>${channelBio}</p>
    </div>
    <p class='channel-status' id='${channelID}-status'>offline</p>
  `;

  const jsChannelsWrap = document.querySelector('.jsChannelsWrap');
  jsChannelsWrap.appendChild(appendHTML);
};

// UI - display stream info
const displayStreamStatus = info => {
  if (info.stream !== null) {
    const channelID = info.stream.channel._id;
    const channelLink = info.stream.channel.url;
    const channelStatus = info.stream.channel.status;
    const addLink = `
    <a href='${channelLink}' target='_blank' rel='noopener'>&raquo; ${channelStatus} &laquo;</a>
    `;
    const channelStatusDOM = document.getElementById(`${channelID}-status`);
    const channelDOM = document.getElementById(`${channelID}`);
    channelStatusDOM.innerHTML = addLink;
    channelDOM.classList.remove('offline');
    channelDOM.classList.add('online');
  }
};

// UI - sort users with All/Online/Offline buttons
const statusButtons = Array.from(document.querySelectorAll('.jsLink'));
const allButton = document.querySelector('.jsAllChannels');
const searchBox = document.getElementById('searchBox');

const setActive = e => {
  statusButtons.forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');
};

const sortChannels = () => {
  const selectedButton = Array.from(
    document.querySelector('.jsLink.active').classList
  );
  const allChannels = document.querySelectorAll('.channel');
  const onChannels = document.querySelectorAll('.channel.online');
  const offChannels = document.querySelectorAll('.channel.offline');

  if (selectedButton.includes('jsOnChannels')) {
    offChannels.forEach(channel => (channel.style.display = 'none'));
    onChannels.forEach(channel => (channel.style.display = 'flex'));
  } else if (selectedButton.includes('jsOffChannels')) {
    onChannels.forEach(channel => (channel.style.display = 'none'));
    offChannels.forEach(channel => (channel.style.display = 'flex'));
  } else if (selectedButton.includes('jsAllChannels')) {
    allChannels.forEach(channel => (channel.style.display = 'flex'));
  }
};

statusButtons.forEach(btn =>
  btn.addEventListener('click', e => {
    e.preventDefault();
    setActive(e);
    sortChannels();
  })
);

// UI - filter users with search input

const filterChannels = val => {
  const allChannels = Array.from(document.querySelectorAll('.channel-name'));
  allChannels.forEach(channel => {
    const rootElement = channel.parentElement.parentElement;
    if (channel.textContent.toLowerCase().indexOf(val) !== -1) {
      rootElement.style.display = 'flex';
    } else {
      rootElement.style.display = 'none';
    }
  });
};

searchBox.addEventListener('keyup', e => {
  e.preventDefault();
  statusButtons.forEach(btn => btn.classList.remove('active'));
  allButton.classList.add('active');
  const text = e.target.value.toLowerCase();
  filterChannels(text);
});

// Events
for (let user of twitchUsers) {
  getClientId
    .then(Id => {
      return getTwitchUsers(Id, user);
    })
    .then(twitch => {
      displayChanells(twitch.users);
      return twitch;
    })
    .then(userIds => {
      getClientId
        .then(Id => {
          return checkTwitchUserStreams(userIds.users[0]._id, Id);
        })
        .then(streams => {
          displayStreamStatus(streams);
        })
        .catch(error => {
          /* eslint-disable-next-line no-console */
          console.log(error);
        });
    })
    .catch(error => {
      /* eslint-disable-next-line no-console */
      console.log(error);
    });
}
