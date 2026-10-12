export default function Hero() {
  return (
    <section>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 md:flex-row md:items-center md:py-14">
        <div className="md:flex-1">
          <h1 className="max-w-[18ch] text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl">
            Light, weather and the people caught in it.
          </h1>
          <p className="mt-4 max-w-[40ch] text-lg text-muted">
            Landscape and street photography, shot on film and digital.
          </p>
        </div>
        <img
          src="https://picsum.photos/id/1016/1200/900"
          alt="Sunlit canyon walls at golden hour"
          className="h-72 w-full rounded object-cover md:h-96 md:min-w-0 md:flex-1"
        />
      </div>
    </section>
  );
}
