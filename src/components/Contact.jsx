import { useState } from "react";

const fieldClass =
  "w-full rounded border border-line bg-white p-3 text-ink focus-visible:outline-deep-text";

export default function Contact() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event) {
    event.preventDefault(); // no backend yet (Week 3)
    setSent(true);
  }

  return (
    <section id="contact" aria-labelledby="contact-title" className="bg-deep text-deep-text">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <h2 id="contact-title" className="mb-6 text-3xl font-bold">
          Book a shoot
        </h2>

        {sent ? (
          <p className="text-lg" role="status">
            Thanks! I'll reply within two days.
          </p>
        ) : (
          <>
            <p className="mb-6 max-w-[60ch]">
              Tell me what you have in mind and I'll reply within two days.
            </p>
            <form onSubmit={handleSubmit} className="grid max-w-2xl gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="name" className="font-bold">Name</label>
                <input id="name" name="name" type="text" required className={fieldClass} />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="font-bold">Email</label>
                <input id="email" name="email" type="email" required className={fieldClass} />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label htmlFor="type" className="font-bold">Type of shoot</label>
                <select id="type" name="type" className={fieldClass}>
                  <option>Portrait</option>
                  <option>Event</option>
                  <option>Landscape commission</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label htmlFor="message" className="font-bold">Message</label>
                <textarea id="message" name="message" rows="5" required className={fieldClass} />
              </div>
              <button
                type="submit"
                className="cursor-pointer justify-self-start rounded bg-deep-text px-6 py-3 font-bold text-deep hover:bg-white focus-visible:outline-deep-text"
              >
                Send request
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
