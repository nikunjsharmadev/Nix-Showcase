import "./HotelDetails.css"
const HotelDetails = () => {
  return (
    <div className="hotel-details">
      <div className="breadcrumb">Home / Hotels / Hilton Downtown</div>

      <div className="hotel-header">
        <div>
          <h1>Hilton Downtown</h1>

          <p className="location">⭐ 4.8 • Toronto, Canada</p>
        </div>

        <button className="share-btn">Share</button>
      </div>

      <div className="gallery">
        <img className="main-image" src="https://picsum.photos/900/500" />

        <div className="thumbs">
          <img src="https://picsum.photos/200/150?1" />

          <img src="https://picsum.photos/200/150?2" />

          <img src="https://picsum.photos/200/150?3" />

          <img src="https://picsum.photos/200/150?4" />
        </div>
      </div>

      <div className="content">
        <div className="left">
          <section className="description">
            <h2>About this hotel</h2>

            <p>
              Enjoy a luxury stay in downtown Toronto with premium amenities,
              modern rooms and spectacular skyline views.
            </p>
          </section>

          <section>
            <h2>Amenities</h2>

            <div className="amenities">
              <span>📶 Free WiFi</span>

              <span>🏊 Swimming Pool</span>

              <span>🍽 Restaurant</span>

              <span>🚗 Parking</span>

              <span>💪 Gym</span>

              <span>❄ Air Conditioning</span>
            </div>
          </section>

          <section>
            <h2>Reviews</h2>

            <div className="review">
              <h4>★★★★★ Amazing Stay</h4>

              <p>Beautiful rooms and excellent service.</p>
            </div>

            <div className="review">
              <h4>★★★★★ Highly Recommended</h4>

              <p>Great location near downtown.</p>
            </div>
          </section>
        </div>

        <aside className="booking-card">
          <h2>$180</h2>

          <span>per night</span>

          <input type="date" />

          <input type="date" />

          <select>
            <option>1 Guest</option>

            <option>2 Guests</option>

            <option>3 Guests</option>
          </select>

          <button>Reserve</button>
        </aside>
      </div>
    </div>
  );
};
export default HotelDetails;
