/*
  Project: Doggo Gallery – React Version
  Author: Abhishek Anand Raj Makka (abhi)
  AI Assist: ChatGPT was used for initial scaffolding and comments.
             All code has been reviewed, tested, and adapted by the author.
*/

import React, { useEffect, useRef, useState } from "react";
import "./App.css";

const API = {
  breeds: "https://dog.ceo/api/breeds/list/all",
  imagesForBreed: (breed) => `https://dog.ceo/api/breed/${breed}/images`,
};

function App() {
  const [breeds, setBreeds] = useState([]);
  const [selectedBreed, setSelectedBreed] = useState("");
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState("Loading breeds…");
  const slideTimerRef = useRef(null);

  // Load all breeds once when the app mounts
  useEffect(() => {
    async function loadBreeds() {
      try {
        setStatus("Fetching breeds…");
        const res = await fetch(API.breeds);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        if (data.status !== "success") {
          throw new Error("API error retrieving breeds.");
        }

        const options = [];
        Object.entries(data.message).forEach(([breed, subs]) => {
          if (subs.length === 0) {
            options.push(breed);
          } else {
            subs.forEach((s) => options.push(`${breed}/${s}`));
          }
        });

        options.sort();
        setBreeds(options);
        setSelectedBreed(options[0] || "");
        setStatus(
          `Loaded ${options.length} breeds. Choose one and click “Fetch Images”.`
        );
      } catch (err) {
        setStatus(`Error loading breeds: ${err.message}`);
      }
    }

    loadBreeds();

    // cleanup slideshow timer when component unmounts
    return () => stopSlideshow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Let Enter key advance to next image
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Enter") {
        next();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  async function fetchImages() {
    if (!selectedBreed) return;
    try {
      stopSlideshow();
      setStatus(`Fetching images for ${selectedBreed}…`);
      const res = await fetch(API.imagesForBreed(selectedBreed));
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.status !== "success") {
        throw new Error("API error retrieving images.");
      }

      const list = data.message.slice(0, 60); // keep it reasonable
      setImages(list);
      setIndex(0);
      setStatus(
        `Loaded ${list.length} images. Use Prev/Next or Play/Pause slideshow.`
      );
    } catch (err) {
      setStatus(`Error loading images: ${err.message}`);
    }
  }

  function prev() {
    if (!images.length) return;
    setIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }

  function next() {
    if (!images.length) return;
    setIndex((prevIndex) => (prevIndex + 1) % images.length);
  }

  function startSlideshow() {
    if (slideTimerRef.current || !images.length) return;
    slideTimerRef.current = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);
    setStatus("Slideshow playing (2s)…");
  }

  function stopSlideshow() {
    if (slideTimerRef.current) {
      clearInterval(slideTimerRef.current);
      slideTimerRef.current = null;
      setStatus("Slideshow paused.");
    }
  }

  const hasImage = images.length > 0;
  const currentImage = hasImage ? images[index] : "";

  return (
    <div className="App">
      <header className="header">
        <h1>Doggo Gallery 🐶 (React)</h1>
        <p className="sub">
          Dog breeds slideshow using React, fetch, Promises, and async/await.
        </p>
      </header>

      <main className="container">
        <section className="controls">
          <label htmlFor="breedSelect">Breed</label>
          <select
            id="breedSelect"
            value={selectedBreed}
            onChange={(e) => setSelectedBreed(e.target.value)}
          >
            {breeds.map((b) => (
              <option key={b} value={b}>
                {b.replace("/", " – ")}
              </option>
            ))}
          </select>

          <button className="btn primary" onClick={fetchImages}>
            Fetch Images
          </button>
          <button className="btn" onClick={prev} disabled={!hasImage}>
            Prev
          </button>
          <button className="btn" onClick={next} disabled={!hasImage}>
            Next
          </button>
          <button
            className="btn success"
            onClick={startSlideshow}
            disabled={!hasImage}
          >
            Play
          </button>
          <button
            className="btn danger"
            onClick={stopSlideshow}
            disabled={!hasImage}
          >
            Pause
          </button>
        </section>

        <section className="stage" aria-live="polite">
          {hasImage ? (
            <>
              <img src={currentImage} alt="Dog" />
              <div className="caption">
                Image {index + 1} of {images.length} — {selectedBreed}
              </div>
            </>
          ) : (
            <div className="caption">No images loaded yet.</div>
          )}
        </section>

        <section className="thumbs" aria-label="Thumbnails">
          {images.map((src, i) => (
            <img
              key={src + i}
              src={src}
              alt={`Dog thumbnail ${i + 1}`}
              className={i === index ? "thumb active" : "thumb"}
              onClick={() => setIndex(i)}
            />
          ))}
        </section>

        <section className="status">
          <pre>{status}</pre>
        </section>
      </main>

      <footer className="footer">
        <small>
          Images via{" "}
          <a
            href="https://dog.ceo/dog-api/"
            target="_blank"
            rel="noreferrer"
          >
            Dog CEO API
          </a>
          . Tutorial inspiration: Brad Schiff. AI usage and licensing are
          documented in README.md.
        </small>
      </footer>
    </div>
  );
}

export default App;
