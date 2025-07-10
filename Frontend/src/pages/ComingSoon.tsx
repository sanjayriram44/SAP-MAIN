
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ComingSoon = () => {
  const navigate = useNavigate();
  const { productId, moduleId, activityType, activityId } = useParams();

  const activityNames: { [key: string]: string } = {
    'test-scripts': 'Test Script Generation',
    'training': 'Training Documents',
    'config': 'Configuration Document',
    'fs-ts': 'FS & TS Documents',
    'config-mgmt': 'Config Management',
    'code-gen': 'On-demand Code Generation'
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={() => navigate(`/product/${productId}/module/${moduleId}`)} className="p-2 text-gray-300 hover:text-white hover:bg-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {activityNames[activityId || ''] || 'Feature'}
              </h1>
              <p className="text-gray-300">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-gray-300 text-lg">This feature is coming soon!</p>
      </div>
    </div>
  );
};

export default ComingSoon;
