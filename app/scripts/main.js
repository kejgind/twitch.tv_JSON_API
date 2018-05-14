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
  'armatvhs',
];

const getClientId = new Promise((resolve, reject) => {
  fetch(clientIdURL)
    .then(resolve => resolve.json())
    .then(data => resolve(data.clientID))
    .catch(error => reject(error));
});

const getTwitchUsers = (clientId, twitchUser) => {
  return new Promise((resolve, reject) => {
    fetch(`${twitchUsersURL}${twitchUser}`, {
      headers: {
        Accept: 'application/vnd.twitchtv.v5+json',
        'Client-ID': clientId,
      },
    })
      .then(resolve => resolve.json())
      .then(data => resolve(data))
      .catch(error => reject(error));
  });
};

const checkTwitchUserStreams = (twitchUserId, clientId) => {
  return new Promise((resolve, reject) => {
    fetch(`${twitchStreamsURL}${twitchUserId}`, {
      headers: {
        Accept: 'application/vnd.twitchtv.v5+json',
        'Client-ID': clientId,
      },
    })
      .then(resolve => resolve.json())
      .then(data => resolve(data))
      .catch(error => reject(error));
  });
};

const displayChanells = element => {
  const channelName = element[0].display_name;
  const channelBio = element[0].bio;
  const channelLogo = element[0].logo;
  const channelID = element[0]._id;

  let appendHTML = document.createElement('div');
  appendHTML.id = channelID;
  appendHTML.className = 'channel';
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
    channelDOM.classList.add('online');
  }
};

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
          /* eslint-disable-next-line no-console */
          console.log(streams);
          return displayStreamStatus(streams);
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
