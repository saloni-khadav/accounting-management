/**
 * PROFESSIONAL UI DESIGN PATTERN FOR ALL AR COMPONENTS
 * Apply these patterns to: Client Master, Proforma Invoice, Tax Invoice, 
 * Credit Note, Client Outstanding, Collection Register, Debtors Aging, AR Reconciliation
 */

// COMMON DESIGN ELEMENTS TO USE:

// 1. CONTAINER WRAPPER
<div className="p-8 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen">

// 2. PAGE HEADER
<div className="mb-8">
  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
    [Component Title]
  </h1>
  <p className="text-gray-600 text-lg">[Component Description]</p>
</div>

// 3. ACTION BUTTONS
<button className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold">
  <Icon className="h-4 w-4 mr-2" />
  Button Text
</button>

// 4. FILTER/SEARCH SECTION
<div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">Label</label>
      <input className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium" />
    </div>
  </div>
</div>

// 5. METRIC CARDS
<div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
  <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10"></div>
  <div className="relative">
    <div className="flex items-center justify-between mb-4">
      <Icon className="h-8 w-8" />
      <ArrowUpRight className="h-5 w-5" />
    </div>
    <div className="text-sm font-semibold mb-2 opacity-90">Metric Title</div>
    <div className="text-3xl font-bold">Value</div>
  </div>
</div>

// 6. DATA TABLE
<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
  <div className="px-8 py-6 bg-gradient-to-r from-blue-50 via-white to-purple-50 border-b border-gray-200">
    <h3 className="text-2xl font-bold text-gray-900">Table Title</h3>
    <p className="text-sm text-gray-600 mt-1">Table description</p>
  </div>
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
            Column Header
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        <tr className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200">
          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
            Cell Content
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

// 7. STATUS BADGES
<span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold border bg-green-100 text-green-700 border-green-200">
  Status Text
</span>

// 8. FORM INPUTS
<div>
  <label className="block text-sm font-bold text-gray-700 mb-2">Field Label</label>
  <input 
    type="text"
    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
    placeholder="Enter value..."
  />
</div>

// 9. DROPDOWN/SELECT
<select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium">
  <option>Option 1</option>
</select>

// 10. MODAL/DIALOG
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
    <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6 border-b border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900">Modal Title</h2>
    </div>
    <div className="p-8">
      {/* Modal Content */}
    </div>
  </div>
</div>

// COLOR PALETTE:
// Primary Blue: from-blue-500 to-blue-600
// Success Green: from-green-500 to-green-600
// Warning Orange: from-orange-500 to-orange-600
// Danger Red: from-red-500 to-red-600
// Purple: from-purple-500 to-purple-600
// Indigo: from-indigo-500 to-indigo-600

// SPACING:
// Container padding: p-8
// Card padding: p-6 or p-8
// Gap between elements: gap-6 or gap-8
// Margin bottom: mb-6 or mb-8

// SHADOWS:
// Default: shadow-lg
// Hover: hover:shadow-2xl
// Cards: shadow-lg border border-gray-100

// BORDER RADIUS:
// Buttons/Inputs: rounded-xl
// Cards: rounded-2xl
// Badges: rounded-lg or rounded-full

// TRANSITIONS:
// All interactive elements: transition-all duration-200 or duration-300

// TYPOGRAPHY:
// Page Title: text-4xl font-bold
// Section Title: text-2xl font-bold
// Card Title: text-xl font-bold
// Labels: text-sm font-bold
// Body: text-sm or text-base font-medium

export default null;