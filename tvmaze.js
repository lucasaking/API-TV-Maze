"use strict";

const MISSING_IMAGE_URL = "https://tinyurl.com/missing-tv";
const TVMAZE_API_URL = "http://api.tvmaze.com/";

const $showsList = $("#showsList");
const $episodesList = $("#episodesList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const response = await axios({
    url: `${TVMAZE_API_URL}search/shows?q=${term}`,
    method: "GET",
  });

  return response.data.map((result) => {
    const show = result.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : MISSING_IMAGE_URL,
      rating: show.rating,
      url: show.url,
    };
  });
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    let result = show.rating ? Math.floor(Object.values(show.rating)) : 0;
    let stars = Array(result).fill(["⭐"]);

    const $show = $(
      `<div style="border: 5px solid black; border-radius: 10px; padding: 20px; "><div data-show-id="${
        show.id
      }" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img src="${show.image}" alt="${show.name}" class="w-25 mr-3">
           <div class="media-body">
             <a href="${show.url}" target="_blank"><h3 class="text-primary">${
        show.name
      }</h3></a>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
             <h5 class="text-primary"><small>Rating: ${
               show.rating != null ? stars : ""
             } / 10</small></h5>
           </div>
         </div>  
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await axios({
    url: `${TVMAZE_API_URL}shows/${id}/episodes`,
    method: "GET",
  });

  return response.data.map((e) => ({
    id: e.id,
    name: e.name,
    season: e.season,
    number: e.number,
    url: e["url"],
  }));
}

/** Given list of episodes, create markup for each and to DOM */

function populateEpisodes(episodes) {
  $episodesList.empty();

  for (let episode of episodes) {
    const $item = $(
      `<li class="form-group row"><a href=${episode.url} target="_blank">
         ${episode.name}
         (season ${episode.season}, episode ${episode.number})
       </a></li>
      `
    );

    $episodesList.append($item);
  }

  $episodesArea.show();
}

/** Handle click on episodes button: get episodes for show and display */

async function getEpisodesAndDisplay(evt) {
  const showId = $(evt.target).closest(".Show").data("show-id");

  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", getEpisodesAndDisplay);
