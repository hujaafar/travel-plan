import { useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Plus,
  Plane,
  MapPin,
  Hotel,
  Compass,
  MoveUpRight,
} from "lucide-react";
import {
  type Travel,
  type User,
  type Gateway,
  date,
  money,
  photo,
} from "./types";
import { useScrollScene } from "./useScrollScene";

type Props = {
  travels: Travel[];
  users: User[];
  gateways: Gateway[];
  canTravel: boolean;
  onCreate: () => void;
  onOpen: (travel: Travel) => void;
  onPlans: () => void;
  onExport: () => void;
};
export default function Overview({
  travels,
  users,
  gateways,
  canTravel,
  onCreate,
  onOpen,
  onPlans,
  onExport,
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [activeStop, setActiveStop] = useState(0);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = travels
    .filter(
      (t) => t.status === "PUBLISHED" && t.start_date.slice(0, 10) >= today,
    )
    .sort((a, b) => a.start_date.localeCompare(b.start_date));
  const featured = upcoming[0] || travels[0];
  const others = travels.filter((t) => t.id !== featured?.id).slice(0, 3);
  const stops = (featured?.stops || []).slice(0, 4);
  const current = Math.min(activeStop, Math.max(stops.length - 1, 0));
  const revision = `${featured?.id}:${featured?.version}:${stops.length}:${others.length}`;
  useScrollScene(root, revision, setActiveStop);
  const edition = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  function goToStop(index: number) {
    const target = root.current?.querySelector<HTMLElement>(
      `[data-route-stop="${index}"]`,
    );
    if (!target) return;
    target.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "center",
    });
    target.focus({ preventScroll: true });
  }

  return (
    <div className="editorial-overview" ref={root}>
      <section
        className="dispatch-opening"
        data-sc-act="flow"
        aria-labelledby="desk-title"
      >
        <div className="dispatch-meta">
          <span>TRAVEL PLAN / THE WORKSPACE</span>
          <span>{edition} edition</span>
        </div>
        <div className="dispatch-title-row">
          <h1 id="desk-title">
            The departure <br />
            <em>desk.</em>
            <span className="title-period" aria-hidden="true">
              *
            </span>
          </h1>
          <div className="dispatch-intro">
            <p>
              For the places you’ll go.
              <br />
              And everything that gets you there.
            </p>
            <button
              className="button primary"
              onClick={onCreate}
              disabled={!canTravel}
            >
              <Plus size={17} /> Create travel plan
            </button>
            <span>A little planning. A world of possibility.</span>
          </div>
        </div>
        {featured ? (
          <div className="dispatch-cover-wrap">
            <article className="dispatch-cover" aria-label={featured.title}>
              <div className="cover-photograph">
                <img
                  src={photo(featured.image)}
                  alt={`${featured.stops[0]?.country || "Travel"} destination photograph`}
                  width="1600"
                  height="1000"
                  fetchPriority="high"
                />
              </div>
              <div className="cover-corner" aria-hidden="true" />
              <div className="cover-copy">
                <span>
                  {upcoming.length
                    ? "NEXT ON THE HORIZON"
                    : "FROM YOUR SAVED PLANS"}
                </span>
                <h2>{featured.title}</h2>
                <button onClick={() => onOpen(featured)}>
                  Explore itinerary <ArrowUpRight size={20} />
                </button>
              </div>
              <div className="cover-location">
                <MapPin size={14} />
                {featured.stops.map((s) => s.destination).join(" / ")}
              </div>
              <div className="cover-seal" aria-hidden="true">
                <span>MADE FOR</span>
                <Compass size={34} strokeWidth={1} />
                <span>GOING PLACES</span>
              </div>
            </article>
            <div className="departure-ticket-plane">
              <aside className="departure-ticket">
                <div className="ticket-top">
                  <span>YOUR NEXT CHAPTER</span>
                  <Plane size={17} />
                </div>
                <div className="ticket-date">
                  <strong>
                    {date(featured.start_date, { day: "2-digit" })}
                  </strong>
                  <span>
                    {date(featured.start_date, { month: "short" })}
                    <small>
                      {date(featured.start_date, { year: "numeric" })}
                    </small>
                  </span>
                </div>
                <div className="ticket-destination">
                  <strong>{featured.stops[0]?.country}</strong>
                  <span>
                    {featured.duration} days, {featured.stops.length}{" "}
                    {featured.stops.length === 1
                      ? "destination"
                      : "destinations"}
                  </span>
                </div>
                <div className="ticket-perforation" />
                <div className="ticket-bottom">
                  <span>
                    TRAVELLERS
                    <strong>
                      {featured.participantIds.length}
                      <i> / {featured.capacity}</i>
                    </strong>
                  </span>
                  <button
                    aria-label={`View travel details for ${featured.title}`}
                    onClick={() => onOpen(featured)}
                  >
                    <ArrowUpRight size={24} />
                  </button>
                </div>
                <div className="ticket-barcode" aria-hidden="true" />
                <span className="ticket-reference">
                  TP / {featured.id.slice(-6).toUpperCase()}
                </span>
              </aside>
            </div>
            <div className="cover-caption">
              <span>Consider this your out-of-office inspiration.</span>
              <span>
                {featured.stops[0]?.country} · {date(featured.start_date)}—
                {date(featured.end_date)}
              </span>
            </div>
          </div>
        ) : (
          <div className="dispatch-empty">
            <Compass size={44} />
            <h2>Your story starts with a place.</h2>
            <p>Create your first travel plan to start filling this desk.</p>
            <button
              className="button primary"
              onClick={onCreate}
              disabled={!canTravel}
            >
              Create travel plan <Plus size={17} />
            </button>
          </div>
        )}
      </section>

      <section
        className="desk-numbers"
        aria-label="Workspace at a glance"
        data-sc-act="flow"
      >
        {[
          {
            label: "Journeys on the desk",
            value: travels.length,
            detail: `${travels.filter((t) => t.status === "PUBLISHED").length} published`,
          },
          {
            label: "People along the way",
            value: users.length,
            detail: `${users.filter((u) => u.status === "ACTIVE").length} active accounts`,
          },
          {
            label: "Departures ahead",
            value: upcoming.length,
            detail: "Published & upcoming",
          },
          {
            label: "Payment gateways",
            value: gateways.length,
            detail: `${gateways.filter((g) => g.configured).length} connected`,
          },
        ].map((m, index) => (
          <div
            className="desk-number metric"
            key={m.label}
            data-sc-in
            style={
              { "--reveal-delay": `${index * 65}ms` } as React.CSSProperties
            }
          >
            <span>{m.label}</span>
            <strong>
              {String(m.value).padStart(2, "0")}
              <small>{m.detail}</small>
            </strong>
          </div>
        ))}
      </section>

      {featured && stops.length > 0 && (
        <section
          className="journey-reader"
          aria-labelledby="journey-reader-title"
          data-sc-act="flow"
        >
          <div className="reader-heading">
            <div>
              <span className="section-rule-label">
                THE JOURNEY, CONSIDERED
              </span>
              <h2 id="journey-reader-title">
                A place for <em>every moment.</em>
              </h2>
            </div>
            <button className="text-link" onClick={() => onOpen(featured)}>
              Open full itinerary <ArrowUpRight size={18} />
            </button>
          </div>
          <div className="reader-layout">
            <div className="route-bookmark">
              <div className="bookmark-photo">
                {stops.map((stop, index) => {
                  const name = stop.destination.toLowerCase();
                  const key =
                    stop.country.toLowerCase() === "indonesia" &&
                    ["ubud", "uluwatu"].includes(name)
                      ? name
                      : featured.image;
                  return (
                    <img
                      key={index}
                      src={photo(key)}
                      alt={
                        index === current
                          ? `Destination photograph for ${stop.destination}, ${stop.country}`
                          : ""
                      }
                      aria-hidden={index !== current}
                      className={index === current ? "current" : ""}
                      width="800"
                      height="1000"
                      loading="lazy"
                    />
                  );
                })}
                <div className="bookmark-photo-caption">
                  <span>{featured.title}</span>
                  <strong>{stops[current]?.destination}</strong>
                </div>
              </div>
              <div className="bookmark-paper">
                <div className="bookmark-header">
                  <span>YOUR ROUTE</span>
                  <span>{featured.duration} DAYS</span>
                </div>
                <div
                  className="route-track"
                  style={
                    {
                      "--route-progress":
                        stops.length > 1 ? current / (stops.length - 1) : 1,
                    } as React.CSSProperties
                  }
                >
                  <div className="route-track-line" aria-hidden="true" />
                  {stops.map((stop, index) => (
                    <button
                      key={index}
                      className={
                        index === current
                          ? "route-location current"
                          : "route-location"
                      }
                      onClick={() => goToStop(index)}
                      aria-current={index === current ? "step" : undefined}
                      aria-label={`Read about ${stop.destination}`}
                    >
                      <i />
                      <span>{stop.destination}</span>
                    </button>
                  ))}
                </div>
                <div className="bookmark-note">
                  <span>
                    {date(featured.start_date)} – {date(featured.end_date)}
                  </span>
                  <span>
                    {current + 1} of {featured.stops.length} stops
                  </span>
                </div>
              </div>
            </div>
            <div className="route-reading-list">
              {stops.map((stop, index) => (
                <article
                  key={index}
                  className={`route-reading-stop ${index === current ? "current" : ""}`}
                  data-route-stop={index}
                  tabIndex={-1}
                  aria-labelledby={`stop-title-${index}`}
                >
                  <div className="stop-topline">
                    <span>STOP {String(index + 1).padStart(2, "0")}</span>
                    <span>{stop.country}</span>
                  </div>
                  <h3 id={`stop-title-${index}`}>
                    {stop.destination}
                    <span>.</span>
                  </h3>
                  <div className="stop-activity">
                    <Compass size={20} />
                    <div>
                      <span>MAKE A MEMORY</span>
                      <p>{stop.activities}</p>
                    </div>
                  </div>
                  <div className="stop-practical">
                    <div>
                      <Hotel size={18} />
                      <span>STAY A WHILE</span>
                      <p>{stop.accommodation}</p>
                    </div>
                    <div>
                      <MoveUpRight size={18} />
                      <span>GETTING THERE</span>
                      <p>{stop.transportation}</p>
                    </div>
                  </div>
                  <button
                    className="stop-open"
                    onClick={() => onOpen(featured)}
                  >
                    See the whole journey <ArrowRight size={18} />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        className="desk-collection"
        aria-labelledby="collection-title"
        data-sc-act="flow"
      >
        <div className="collection-heading">
          <h2 id="collection-title">
            Still on your <em>mind.</em>
          </h2>
          <div>
            <p>A few more places in the making.</p>
            <button className="text-link" onClick={onPlans}>
              All travel plans <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
        <div className="editorial-journeys">
          {others.map((travel, index) => (
            <article
              className="editorial-journey journey-card"
              key={travel.id}
              data-sc-in
              style={
                { "--reveal-delay": `${index * 90}ms` } as React.CSSProperties
              }
            >
              <button
                className="journey-portrait"
                onClick={() => onOpen(travel)}
                aria-label={`Explore ${travel.title}`}
              >
                <img
                  src={photo(travel.image)}
                  alt={`${travel.stops[0]?.country || "Travel"} destination`}
                  width="800"
                  height="1000"
                  loading="lazy"
                />
                <span className="portrait-arrow">
                  <ArrowUpRight size={23} />
                </span>
                <span className="portrait-duration">
                  {travel.duration} DAYS AWAY
                </span>
              </button>
              <div className="editorial-journey-meta">
                <span>{travel.stops[0]?.country}</span>
                <span className={"status-dot " + travel.status.toLowerCase()}>
                  {travel.status.toLowerCase()}
                </span>
              </div>
              <h3>
                <button onClick={() => onOpen(travel)}>{travel.title}</button>
              </h3>
              <div className="editorial-journey-foot">
                <span>{date(travel.start_date)}</span>
                <span>
                  {money(travel.price)} <small>/ person</small>
                </span>
              </div>
            </article>
          ))}
        </div>
        {!others.length && (
          <p className="collection-empty">
            Your next saved journey will appear here.
          </p>
        )}
      </section>

      <section className="desk-close" data-sc-act="flow">
        <div>
          <span className="closing-star" aria-hidden="true">
            ✳
          </span>
          <h2>
            Where <em>next?</em>
          </h2>
          <p>A blank page. A new place. Your move.</p>
        </div>
        <div className="closing-actions">
          <button
            className="button primary"
            onClick={onCreate}
            disabled={!canTravel}
          >
            Create travel plan <Plus size={18} />
          </button>
          <button className="text-link" onClick={onExport}>
            Take your plans with you <ArrowDownToLine size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}
