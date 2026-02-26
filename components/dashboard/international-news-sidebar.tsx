

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Globe, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface NewsOutlet {
  name: string
  location: string
  url: string
  description: string
}

interface NewsRegion {
  name: string
  outlets: NewsOutlet[]
}

const newsRegions: NewsRegion[] = [
  {
    name: "North America (Outside U.S.)",
    outlets: [
      {
        name: "The Globe and Mail",
        location: "Toronto, Canada",
        url: "https://www.theglobeandmail.com/",
        description: "Strong economics desk; often ties U.S. tariffs to commodity and auto sectors"
      },
      {
        name: "CBC News",
        location: "Ottawa, Canada", 
        url: "https://www.cbc.ca/news",
        description: "Tracks U.S.–Canada trade, steel/aluminum tariffs, and price impacts"
      },
      {
        name: "The Breach",
        location: "Montreal, Canada",
        url: "https://breachmedia.ca/",
        description: "Independent, progressive lens on North American economic policy"
      }
    ]
  },
  {
    name: "Europe",
    outlets: [
      {
        name: "The Financial Times",
        location: "London, UK",
        url: "https://www.ft.com/",
        description: "Deep coverage of trans-Atlantic trade, supply chains, energy, and tariffs"
      },
      {
        name: "Reuters",
        location: "London HQ, global network",
        url: "https://www.reuters.com/",
        description: "Daily reporting on U.S. trade policy impact worldwide"
      },
      {
        name: "Deutsche Welle (DW)",
        location: "Bonn/Berlin, Germany",
        url: "https://www.dw.com/en",
        description: "Clear explainers on EU–U.S. trade relations and price spillovers"
      }
    ]
  },
  {
    name: "Southern / Eastern Africa",
    outlets: [
      {
        name: "Mail & Guardian",
        location: "Johannesburg, South Africa",
        url: "https://mg.co.za/",
        description: "Covers how U.S. and Chinese trade shifts affect African exports"
      },
      {
        name: "Business Day (BDLive)",
        location: "Johannesburg, South Africa",
        url: "https://www.businesslive.co.za/",
        description: "Business reporting on U.S. dollar movements, tariffs, and local consequences"
      },
      {
        name: "The EastAfrican",
        location: "Nairobi, Kenya",
        url: "https://www.theeastafrican.co.ke/",
        description: "Regional economic paper tying U.S. policy to African agriculture and textiles"
      }
    ]
  },
  {
    name: "Middle East / North Africa",
    outlets: [
      {
        name: "Al Jazeera English",
        location: "Doha, Qatar",
        url: "https://www.aljazeera.com/",
        description: "Frequent analysis on U.S. oil policy, sanctions, and global inflation"
      },
      {
        name: "Arab News",
        location: "Riyadh, Saudi Arabia",
        url: "https://www.arabnews.com/",
        description: "Trade, energy, and supply-chain reporting with Gulf-region context"
      },
      {
        name: "Haaretz English Edition",
        location: "Tel Aviv, Israel",
        url: "https://www.haaretz.com/",
        description: "Op-eds on U.S. foreign trade decisions and regional effects"
      }
    ]
  },
  {
    name: "Asia-Pacific",
    outlets: [
      {
        name: "Nikkei Asia",
        location: "Tokyo, Japan",
        url: "https://asia.nikkei.com/",
        description: "Premier source on semiconductor and automotive supply-chain policy"
      },
      {
        name: "The Straits Times",
        location: "Singapore",
        url: "https://www.straitstimes.com/",
        description: "U.S.–China trade tension, regional ripple effects, and shipping costs"
      },
      {
        name: "South China Morning Post",
        location: "Hong Kong",
        url: "https://www.scmp.com/",
        description: "Broad coverage of U.S.–China tariffs and consumer-level impact"
      }
    ]
  },
  {
    name: "Latin America",
    outlets: [
      {
        name: "Buenos Aires Times",
        location: "Argentina",
        url: "https://www.batimes.com.ar/",
        description: "Focuses on grain, beef, and energy markets reacting to U.S. trade moves"
      },
      {
        name: "Valor Econômico",
        location: "São Paulo, Brazil",
        url: "https://valor.globo.com/",
        description: "Analyzes U.S. tariff policy and its influence on Latin exports"
      },
      {
        name: "El País (América edition)",
        location: "Madrid HQ; Latin-focused",
        url: "https://elpais.com/america/",
        description: "Bilingual reporting on U.S.–Latin trade links"
      }
    ]
  },
  {
    name: "Western Europe",
    outlets: [
      {
        name: "Le Monde",
        location: "Paris, France",
        url: "https://www.lemonde.fr/en/",
        description: "EU–U.S. trade policy reporting with consumer impact angle"
      },
      {
        name: "Euronews",
        location: "Lyon, France",
        url: "https://www.euronews.com/",
        description: "Accessible explainers connecting tariffs to energy and inflation trends"
      }
    ]
  }
]

export default function InternationalNewsSidebar() {
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set())

  const toggleRegion = (regionName: string) => {
    const newExpanded = new Set(expandedRegions)
    if (newExpanded.has(regionName)) {
      newExpanded.delete(regionName)
    } else {
      newExpanded.add(regionName)
    }
    setExpandedRegions(newExpanded)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Globe className="h-4 w-4 text-turquoise-600" />
          From Other Parts of the Globe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Why These Outlets Matter Section */}
        <div className="space-y-2 p-3 bg-pale-copper-50 border border-pale-copper-200 rounded-lg">
          <h4 className="text-sm font-semibold text-earth-brown-800">
            Why These Outlets Matter
          </h4>
          <p className="text-xs text-gray-700 leading-relaxed">
            U.S. trade decisions ripple through the world, raising or lowering prices far beyond our borders. These international sources show how others see those effects.
          </p>
          <p className="text-xs text-gray-700 leading-relaxed">
            Just remember: "foreign" doesn't mean "neutral." Every outlet has a viewpoint. Compare a few stories before deciding what's really happening.
          </p>
        </div>
        {newsRegions.map((region) => (
          <div key={region.name} className="border border-gray-200 rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto text-left font-medium text-sm hover:bg-creamy-tan-50"
              onClick={() => toggleRegion(region.name)}
            >
              <span className="text-earth-brown-800">{region.name}</span>
              {expandedRegions.has(region.name) ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </Button>
            
            <AnimatePresence>
              {expandedRegions.has(region.name) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 space-y-3 bg-creamy-tan-25">
                    {region.outlets.map((outlet) => (
                      <div key={outlet.name} className="text-xs">
                        <a
                          href={outlet.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-1 hover:text-turquoise-600 transition-colors group"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="font-medium text-gray-900 group-hover:text-turquoise-600">
                                {outlet.name}
                              </span>
                              <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-turquoise-500" />
                            </div>
                            <p className="text-gray-600 mb-1">({outlet.location})</p>
                            <p className="text-gray-500 leading-relaxed">
                              {outlet.description}
                            </p>
                          </div>
                        </a>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
