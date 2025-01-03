import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Product } from '@/lib/api'
import { useCart } from '@/app/contexts/CartContext'
import { useToast } from '@/components/ui/use-toast'

interface ProductCardProps {
    product: Product
    compact?: boolean
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
    const { addItem } = useCart()
    const { toast } = useToast()
    const [isAdding, setIsAdding] = useState(false)

    const handleAddToCart = async () => {
        setIsAdding(true)
        try {
            await addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.images[0] || '/placeholder.svg'
            })
            toast({
                title: "Produit ajouté au panier",
                description: `${product.name} a été ajouté à votre panier.`,
            })
            console.log('Product added to cart:', product.name)
        } catch (error) {
            console.error('Error adding product to cart:', error)
            toast({
                title: "Erreur",
                description: "Impossible d'ajouter le produit au panier.",
                variant: "destructive",
            })
        } finally {
            setIsAdding(false)
        }
    }

    if (compact) {
        return (
            <Card className="overflow-hidden h-full">
                <div className="flex flex-col xs:flex-row h-full">
                    <div className="relative w-full xs:w-1/3 aspect-square xs:aspect-auto">
                        <Image
                            src={product.images[0] || '/placeholder.svg'}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
                        />
                    </div>
                    <div className="w-full xs:w-2/3 p-2 xs:p-3 sm:p-4 flex flex-col justify-between">
                        <div>
                            <h3 className="font-medium text-sm sm:text-base mb-1 line-clamp-1">{product.name}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 hidden xs:block">{product.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2 xs:mt-0">
                            <span className="text-sm sm:text-base font-bold">{product.price.toFixed(2)} €</span>
                            <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                        </div>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card className="group h-full overflow-hidden bg-white transition-all duration-300 hover:shadow-lg flex flex-col">
            <div className="relative pt-[100%] xs:pt-[75%] sm:pt-[100%]">
                <Image
                    src={product.images[0] || '/placeholder.svg'}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    priority
                />
                <Badge
                    variant="secondary"
                    className="absolute top-2 right-2 text-xs font-medium"
                >
                    {product.category}
                </Badge>
            </div>
            <CardContent className="p-3 sm:p-4 md:p-5 flex flex-col justify-between flex-grow">
                <div className="space-y-1 sm:space-y-2">
                    <h3 className="font-medium text-sm sm:text-base md:text-lg line-clamp-2">
                        {product.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 md:line-clamp-3">
                        {product.description}
                    </p>
                    <p className="text-base sm:text-lg md:text-xl font-bold mt-1 sm:mt-2">
                        {product.price.toFixed(2)} €
                    </p>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2 sm:mt-3">
                    {product.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2 p-3 sm:p-4 md:p-5 pt-0">
                <Button
                    variant="default"
                    asChild
                    className="w-full h-8 sm:h-9 md:h-10 text-xs sm:text-sm font-medium"
                >
                    <Link href={`/produit/${product.id}`} className="flex items-center justify-center w-full h-full">
                        Voir détails
                    </Link>
                </Button>
                <Button
                    variant="outline"
                    className="w-full h-8 sm:h-9 md:h-10 text-[10px] xs:text-xs sm:text-sm font-medium flex items-center justify-center px-1 sm:px-2"
                    onClick={handleAddToCart}
                    disabled={isAdding}
                >
                    <span className="truncate">
                        {isAdding ? 'Ajout...' : 'Ajouter au panier'}
                    </span>
                </Button>
            </CardFooter>
        </Card>
    )
}

