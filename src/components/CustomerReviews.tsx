import React from 'react';
import { Star, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { CUSTOMER_REVIEWS } from '../data/initialData';

export const CustomerReviews: React.FC = () => {
  return (
    <section className="py-12 bg-pink-50/40 border-t border-b border-pink-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-pink-100 text-pink-900 border border-pink-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-pink-600" />
            <span>Satisfação Comprovada</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-stone-900 tracking-tight">
            Quem pede na Encanto Mini, se apaixona! 💕
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-stone-600">
            Mais de 1.400 brownies, tapiocas e sucos preparados com muito amor e carinho.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CUSTOMER_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="p-4 bg-white rounded-2xl border border-pink-100 shadow-2xs flex flex-col justify-between hover:border-pink-200 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-stone-400">{rev.date}</span>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-pink-50 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900">{rev.name}</span>
                <span className="text-[10px] font-semibold text-pink-900 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">
                  {rev.badge}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
