import { ShoppingBag, Heart, Sparkles, HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";

export const ProductsPage = () => {
  const products = [
    {
      id: 1,
      name: "Handcrafted Canvas Sneakers",
      description:
        "Unique hand-painted canvas sneakers created by youth during their recovery journey. Each pair tells a story of transformation and hope.",
      image: "/images/products/shoes.jpeg",
      price: 45,
      category: "Footwear",
      inStock: true,
    },
    {
      id: 2,
      name: "Artisan Leather Sandals",
      description:
        "Beautiful leather sandals handmade by our residents learning traditional craftsmanship skills as part of their vocational training.",
      image: "/images/products/shoesmanake.jpeg",
      price: 35,
      category: "Footwear",
      inStock: true,
    },
  ];

  const impactStats = [
    { number: "50+", label: "Youth Trained" },
    { number: "200+", label: "Products Made" },
    { number: "100%", label: "Funds to Program" },
    { number: "15", label: "Skills Learned" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-gold-400" />
              <span className="text-gold-300 font-medium">
                Made with Purpose
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Products Made During Rehabilitation
            </h1>
            <p className="text-xl text-primary-100 leading-relaxed mb-8">
              Every product purchased supports our youth's journey to recovery.
              These handcrafted items are made by residents learning valuable
              vocational skills as part of their healing process.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/donate"
                className="btn bg-gold-500 hover:bg-gold-600 text-gray-900 font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Support Our Mission
              </Link>
              <Link
                to="/contact"
                className="btn bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-3 rounded-lg transition-colors"
              >
                Place Custom Order
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {impactStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Handcrafted with Heart
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Each item represents hours of dedication, learning, and personal
              growth. When you purchase, you invest in someone's future.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                      <Heart className="w-5 h-5 text-secondary-500" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-primary-600">
                      ${product.price}
                    </div>
                    <Link
                      to="/contact"
                      className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Inquire
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              From Recovery to Creation
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our vocational training program teaches residents valuable skills
              while supporting their recovery journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HeartHandshake className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                1. Skills Training
              </h3>
              <p className="text-gray-600 text-sm">
                Residents learn craftsmanship, including shoemaking, leatherwork,
                and design as part of their rehabilitation.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-accent-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                2. Handcrafted Products
              </h3>
              <p className="text-gray-600 text-sm">
                Each product is carefully handmade, representing the dedication
                and growth of our youth.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gold-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gold-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                3. Supporting Recovery
              </h3>
              <p className="text-gray-600 text-sm">
                100% of proceeds go back into our programs, funding treatment,
                training, and aftercare support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-accent-500 to-secondary-500 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">
            Want to Support Our Artisans?
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            Contact us to place a custom order, request bulk purchases for
            corporate gifts, or learn how you can get involved.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="bg-white text-secondary-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Contact Us
            </Link>
            <Link
              to="/donate"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-3 rounded-lg transition-colors"
            >
              Make a Donation
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
