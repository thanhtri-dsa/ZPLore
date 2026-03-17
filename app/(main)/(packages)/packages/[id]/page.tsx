import { notFound } from 'next/navigation'
import PackageDetail from '@/components/packages/packageDetail'
import { getPackageById } from '@/lib/package'
import { PackageWithIncludes, PackageDetailProps } from '@/types/packages'

export default async function PackagePage({ params }: { params: { id: string } }) {
  const pkg = await getPackageById(params.id) as PackageWithIncludes | null

  if (!pkg) {
    notFound()
  }
  const transformedPackage: PackageDetailProps = {
    ...pkg,
    imageUrl: pkg.imageData || '',
  }
  

  return <PackageDetail package={transformedPackage} />
}